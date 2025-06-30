import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  time: string;
  text: string;
  status?: string;
};

type ChatBubbleProps = {
  message: Message;
};

export default function ChatBubble({ message }: ChatBubbleProps) {
  if (message.sender === 'bot') {
    return (
      <View style={styles.botMsgContainer}>
        <View style={styles.botAvatar}>
          <MaterialIcons name="account-circle" size={20} color="#3B82F6" />
        </View>
        <View style={styles.botBubble}>
          <Markdown style={botMarkdownStyles}>{message.text}</Markdown>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.userMsgContainer}>
      <View style={styles.userBubble}>
        <Markdown style={userMarkdownStyles}>{message.text}</Markdown>
      </View>
      <Markdown style={userMarkdownStyles}>
        {message.status === 'Read' ? 'Read' : ''}
      </Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  botMsgContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  botAvatar: {
    marginRight: 8,
    marginTop: 2,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userMsgContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 12,
    maxWidth: '80%',
  },
});

const botMarkdownStyles = {
  text: {
    color: '#374151',
    fontSize: 16,
  },
};

const userMarkdownStyles = {
  text: {
    color: '#fff',
    fontSize: 16,
  },
};
