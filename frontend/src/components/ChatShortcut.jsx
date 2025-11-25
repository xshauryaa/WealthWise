import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { colors } from '../styles/colors';
import { ChevronRight, Send } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ChatShortcut = ({ onViewChat }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle send message logic here
      console.log('Sending message:', message);
      setMessage(''); // Clear input after sending
      // Navigate to chat screen
      onViewChat();
    }
  };

  return (
    <View style={styles.container}>
      {/* Mascot and greeting section */}
      <View style={styles.mascotSection}>
        <Image 
          source={require('../../assets/penny-images/Penny1.png')} 
          style={styles.pennyImage}
          resizeMode="contain"
        />
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hi, I'm Penny,</Text>
          <Text style={styles.greetingText}>your financial wizard!</Text>
        </View>
      </View>

      {/* Text input for asking questions */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask Penny a question"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          value={message}
          onChangeText={setMessage}
          multiline={false}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSendMessage}
          activeOpacity={0.8}
        >
          <Send 
            size={width > 400 ? 20 : 16} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* View Chat button */}
      <TouchableOpacity 
        style={styles.viewChatButton}
        onPress={onViewChat}
        activeOpacity={0.8}
      >
        <Text style={styles.viewChatText}>View Chat</Text>
        <ChevronRight color="#000000" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: width > 400 ? 12 : 10,
    padding: width > 400 ? 16 : 12,
    marginHorizontal: width > 400 ? 16 : 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  mascotSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pennyImage: {
    width: width > 400 ? 80 : 70,
    height: width > 400 ? 80 : 70,
    marginRight: width > 400 ? 16 : 12,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: width > 400 ? 18 : 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'AlbertSans_600SemiBold',
    lineHeight: width > 400 ? 24 : 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: width > 400 ? 12 : 10,
    paddingHorizontal: width > 400 ? 16 : 12,
    paddingVertical: width > 400 ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  textInput: {
    flex: 1,
    fontSize: width > 400 ? 16 : 14,
    color: '#000000',
    fontFamily: 'AlbertSans_400Regular',
    paddingVertical: 0,
  },
  sendButton: {
    marginLeft: width > 400 ? 12 : 8,
    width: width > 400 ? 36 : 32,
    height: width > 400 ? 36 : 32,
    backgroundColor: colors.primary,
    borderRadius: width > 400 ? 18 : 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewChatButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: width > 400 ? 12 : 8,
    paddingVertical: width > 400 ? 8 : 4,
    paddingHorizontal: width > 400 ? 12 : 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: width > 400 ? 8 : 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  viewChatText: {
    fontSize: width > 400 ? 16 : 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'AlbertSans_500Medium',
  },
});

export default ChatShortcut;
