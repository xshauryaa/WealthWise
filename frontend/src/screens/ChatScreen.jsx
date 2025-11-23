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
  Image
} from 'react-native';
import { colors } from '../styles/colors';
import Send from '../../assets/system-icons/Send.svg';
import MarkdownText from '../components/MarkdownText';
import chatData from '../mockups/aiChat.json';

const { width, height } = Dimensions.get('window');

export function ChatScreen() {
  // Load all messages from the first conversation
  const [messages, setMessages] = useState([...chatData.conversations[0].messages]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

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

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: `msg_${Date.now()}`,
        type: 'user',
        content: inputText.trim(),
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText('');
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage = {
          id: `msg_${Date.now() + 1}`,
          type: 'assistant',
          content: "Thanks for your message! I'm here to help you with your **financial questions**. \n\nHere are some things I can help with:\n\n• **Investment advice** and portfolio optimization\n• **Budgeting strategies** to save more money\n• **Risk assessment** for your investments\n• **Goal setting** and financial planning\n\nHow can I assist you today? 💰",
          timestamp: new Date().toISOString()
        };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1500);
    }
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
              <Text style={styles.headerSubtitle}>Your Financial Assistant</Text>
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
              style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
              onPress={sendMessage}
              activeOpacity={0.8}
              disabled={!inputText.trim()}
            >
              <Send 
                width={20} 
                height={20} 
                color={inputText.trim() ? colors.light : colors.grey.medium2}
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
});