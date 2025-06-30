import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import ChatHeader from '../components/ChatHeader';
import ChatBubble from '../components/ChatBubble';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  time: string;
  text: string;
  status?: string;
};

const FLASK_BACKEND_URL = 'http://10.180.50.44:5000/chat';
const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'bot',
    time: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    text: 'Hello, Avel! How can I assist you today?',
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Track the last bot message index
  const lastBotIndexRef = useRef<number | null>(null);

  // Scroll to end when keyboard appears/hides
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Show/hide scroll-to-bottom button
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setShowScrollToBottom(!isAtBottom);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessageText = input.trim();
    const newUserMessage: Message = {
      id: String(messages.length + 1),
      sender: 'user',
      time: getCurrentTime(),
      text: userMessageText,
      status: 'Sent',
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInput('');

    const typingMessage: Message = {
      id: 'typing-indicator',
      sender: 'bot',
      time: getCurrentTime(),
      text: 'Bot is typing...',
    };
    setMessages(prevMessages => [...prevMessages, typingMessage]);
    setIsTyping(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await axios.post(FLASK_BACKEND_URL, {
        message: userMessageText,
      });

      const botResponseText = response.data.response;

      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== 'typing-indicator'),
      );
      setIsTyping(false);

      // Add the actual bot's response
      const botResponse: Message = {
        id: String(messages.length + 2),
        sender: 'bot',
        time: getCurrentTime(),
        text: botResponseText,
      };

      setMessages(prevMessages => {
        const newMessages = [...prevMessages, botResponse];
        // Find the index of the new bot message
        lastBotIndexRef.current = newMessages.length - 1;
        return newMessages;
      });

      // Scroll to the new bot message (not the end)
      setTimeout(() => {
        if (lastBotIndexRef.current !== null) {
          flatListRef.current?.scrollToIndex({
            index: lastBotIndexRef.current,
            animated: true,
            viewPosition: 0, // aligns the item to the top
          });
        }
      }, 200);
    } catch (error: any) {
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== 'typing-indicator'),
      );
      setIsTyping(false);

      console.error(
        'Error sending message to Flask backend:',
        error.response ? error.response.data : error.message,
      );
      const errorMessage: Message = {
        id: String(messages.length + 2),
        sender: 'bot',
        time: getCurrentTime(),
        text: "Sorry, I couldn't get a response. Please check your backend server or try again later.",
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  return (
    <View style={styles.container}>
      <ChatHeader />
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatBubble message={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          // Optionally, you can scroll to end on content change if needed
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {showScrollToBottom && (
        <TouchableOpacity
          style={styles.scrollToBottomBtn}
          onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
        >
          <MaterialIcons name="arrow-downward" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Write a message"
            value={input}
            onChangeText={setInput}
            placeholderTextColor="#9CA3AF"
            multiline
            onFocus={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={sendMessage}
            disabled={isTyping}
          >
            {isTyping ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <MaterialIcons name="send" size={28} color="#3B82F6" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Developed by <Text style={styles.footerLink}>Avel</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messages: { padding: 16, paddingBottom: 0 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
    maxHeight: 100,
  },
  iconBtn: { padding: 6, marginLeft: 2 },
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
  },
  footerText: { color: '#9CA3AF', fontSize: 13 },
  footerLink: { color: '#2563EB', fontWeight: 'bold' },
  scrollToBottomBtn: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 8,
    zIndex: 10,
    elevation: 4,
  },
});
