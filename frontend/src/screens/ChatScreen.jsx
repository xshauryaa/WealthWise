import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { colors } from '../styles/colors';
import { Send } from 'lucide-react-native';
import MarkdownText from '../components/MarkdownText';
import { mlService } from '../services/mlService';
import chatData from '../mockups/aiChat.json';

const { width, height } = Dimensions.get('window');

export function ChatScreen() {
  // Load initial welcome messages from mock data
  const [messages, setMessages] = useState([...chatData.conversations[0].messages.slice(0, 2)]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMLServiceAvailable, setIsMLServiceAvailable] = useState(false);
  const flatListRef = useRef(null);
  
  // Generate a simple user ID (in production, this would come from auth)
  const userId = 'user_001';

  // Check ML service health on component mount
  useEffect(() => {
    checkMLServiceHealth();
    // Set up periodic health checks every 30 seconds
    const healthCheckInterval = setInterval(checkMLServiceHealth, 30000);
    
    return () => clearInterval(healthCheckInterval);
  }, []);

  const checkMLServiceHealth = async () => {
    const wasAvailable = isMLServiceAvailable;
    const isHealthy = await mlService.checkHealth();
    setIsMLServiceAvailable(isHealthy);
    
    if (isHealthy && !wasAvailable) {
      console.log('✅ ML Service is now available - RAG system activated!');
    } else if (isHealthy) {
      console.log('✅ ML Service is available');
    } else {
      console.log('⚠️ ML Service is unavailable, using fallback responses');
    }
  };

  const showMLServiceStatus = () => {
    Alert.alert(
      "ML Service Status", 
      isMLServiceAvailable 
        ? "✅ RAG System is connected and ready!\n\nYour messages are being processed by our advanced AI advisor powered by ChromaDB and Gemini Flash." 
        : "⚠️ ML Service is currently offline.\n\nUsing intelligent fallback responses. The full RAG system with ChromaDB and Gemini Flash will be available when the ML backend is running.",
      [
        { text: "Got it", style: "default" },
        ...(isMLServiceAvailable ? [{ 
          text: "Test RAG", 
          style: "default",
          onPress: () => testRAGConnection()
        }] : [])
      ]
    );
  };

  const testRAGConnection = async () => {
    const testMessage = "Tell me about budgeting strategies";
    setInputText(testMessage);
    setTimeout(() => sendMessage(), 100);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.type === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.assistantMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../../assets/penny-images/Penny1.png')} 
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {isUser ? (
            <Text style={[styles.messageText, styles.userText]}>
              {item.content}
            </Text>
          ) : (
            <MarkdownText 
              style={[styles.messageText, styles.assistantText]}
              isAssistant={true}
            >
              {item.content}
            </MarkdownText>
          )}
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {isUser && (
          <View style={styles.userAvatarContainer}>
            <View style={styles.userAvatar} />
          </View>
        )}
      </View>
    );
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Add user message immediately
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const messageText = inputText.trim();
    setInputText('');
    setIsLoading(true);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Try to get response from ML service
      const aiResponse = await mlService.sendChatMessage(userId, messageText);
      
      const assistantMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback to intelligent responses if ML service fails
      const fallbackResponses = [
        "I apologize, but I'm having trouble connecting to my advanced AI systems right now. However, I'm still here to help with basic **financial guidance**!\n\nSome quick tips:\n• Track your daily expenses\n• Set up automatic savings\n• Review your budget weekly 📊",
        "It seems there's a temporary issue with my connection. In the meantime, here's some valuable advice:\n\n• **Emergency fund**: Aim for 3-6 months of expenses\n• **50/30/20 rule**: 50% needs, 30% wants, 20% savings\n• Start investing even with small amounts 💰",
        "I'm experiencing some technical difficulties, but don't let that stop your **financial journey**!\n\nConsider:\n• Exploring our Learning section for insights\n• Setting up microinvestments\n• Tracking your spending patterns 🎯",
      ];
      
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const assistantMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: randomFallback,
        timestamp: new Date().toISOString()
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
    
    // Auto-scroll to bottom after assistant response
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  useEffect(() => {
    // Auto-scroll to bottom on mount
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 500);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image 
              source={require('../../assets/penny-images/Penny1.png')} 
              style={styles.headerAvatar}
              resizeMode="contain"
            />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Penny</Text>
              <TouchableOpacity onPress={showMLServiceStatus}>
                <Text style={[styles.headerSubtitle, { color: isMLServiceAvailable ? colors.success : colors.warning }]}>
                  {!__DEV__ ? (isMLServiceAvailable ? '🤖 RAG System Active' : '🔄 Intelligent Fallback Mode') : 'Your Intelligent Financial Wizard'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingMessage}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={require('../../assets/penny-images/Penny1.png')} 
                  style={styles.avatarImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.loadingContent}>
                <ActivityIndicator 
                  size="small" 
                  color={colors.primary} 
                  style={styles.loadingSpinner}
                />
                <Text style={styles.loadingText}>Penny is thinking...</Text>
              </View>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Penny about your finances..."
              placeholderTextColor={colors.grey.dark}
              value={inputText}
              onChangeText={setInputText}
              multiline={true}
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (inputText.trim() && !isLoading) ? styles.sendButtonActive : styles.sendButtonInactive]}
              onPress={sendMessage}
              activeOpacity={0.8}
              disabled={!inputText.trim() || isLoading}
            >
              <Send 
                size={20} 
                color={(inputText.trim() && !isLoading) ? colors.light : colors.grey.medium2}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.light,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
    backgroundColor: colors.light,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  avatarImage: {
    width: 32,
    height: 32,
  },
  userAvatarContainer: {
    marginLeft: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    backgroundColor: colors.grey.medium,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.grey.medium,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'AlbertSans_400Regular',
  },
  userText: {
    color: colors.dark,
  },
  assistantText: {
    color: colors.light,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 10,
    fontFamily: 'AlbertSans_400Regular',
  },
  userTimestamp: {
    color: colors.grey.dark,
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    backgroundColor: colors.light,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.grey.light,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.grey.light,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_400Regular',
    maxHeight: 100,
    lineHeight: 20,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: colors.grey.medium2,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grey.ultraLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginLeft: 8,
  },
  loadingSpinner: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    fontStyle: 'italic',
  },
});