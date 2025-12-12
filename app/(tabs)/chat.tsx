import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Message, RecentCalculation, FavoriteCalculation } from '@/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export default function ChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'Which calculator should I use?',
    'Show my recent calculations',
    'Show my favorites',
    'Explain BMI calculation',
  ]);
  const [recents, setRecents] = useState<RecentCalculation[]>([]);
  const [favorites, setFavorites] = useState<FavoriteCalculation[]>([]);
  const [calculators, setCalculators] = useState<any[]>([]);

  useEffect(() => {
    loadChatHistory();
    loadRecentsAndFavorites();
    loadCalculators();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);
  const loadChatHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('chat_history');
      if (history) {
        const parsed = JSON.parse(history);
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadCalculators = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/metadata`);
      if (response.ok) {
        const data = await response.json();
        const allCalcs = data.data.categories.flatMap((cat: any) =>
          cat.calculations.map((calc: any) => ({
            name: calc.name,
            slug: calc.slug || calc.name,
            category: cat.name,
          }))
        );
        console.log('Sample calculators:', allCalcs.slice(0, 10));
        console.log(
          'BMI calculators:',
          allCalcs.filter(
            (c: any) =>
              c.name.toLowerCase().includes('body') ||
              c.name.toLowerCase().includes('bmi')
          )
        );
        setCalculators(allCalcs);
      }
    } catch (error) {
      console.error('Error loading calculators:', error);
    }
  };

  const saveChatHistory = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem('chat_history', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const loadRecentsAndFavorites = async () => {
    try {
      const [recentsData, favoritesData] = await Promise.all([
        AsyncStorage.getItem('recent_calculations'),
        AsyncStorage.getItem('favorite_calculations'),
      ]);

      if (recentsData) setRecents(JSON.parse(recentsData));
      if (favoritesData) setFavorites(JSON.parse(favoritesData));
    } catch (error) {
      console.error('Error loading recents/favorites:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);

    const userInput = inputText.trim();
    setInputText('');
    setIsTyping(true);
    Keyboard.dismiss();

    try {
      const response = await getAIResponse(userInput, updatedMessages);
      const finalMessages = [...updatedMessages, response];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  const getAIResponse = async (
    userInput: string,
    currentMessages: Message[]
  ): Promise<Message> => {
    const recentsContext =
      recents.length > 0
        ? `\n\nUser's Recent Calculations:\n${recents
            .slice(0, 5)
            .map((r) => `- ${r.name}: Result = ${r.result} ${r.unit}`)
            .join('\n')}`
        : '';

    const favoritesContext =
      favorites.length > 0
        ? `\n\nUser's Favorite Calculators:\n${favorites
            .map((f) => `- ${f.name}`)
            .join('\n')}`
        : '';

    const calculatorsContext =
      calculators.length > 0
        ? `\n\nAvailable Calculators:\n${calculators
            .map((c) => `- ${c.name} (slug: ${c.slug})`)
            .join('\n')}`
        : '';

    const conversationHistory = currentMessages
      .slice(-5)
      .map((m) => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const systemContext = `You are ClinicalC AI Assistant, a helpful medical calculation assistant. You help healthcare professionals with clinical calculations, formulas, and parameter interpretations.

Available Context:
${calculatorsContext}
${recentsContext}
${favoritesContext}

Recent Conversation:
${conversationHistory}

When responding:
1. Be concise and clinical
2. Only suggest opening a calculator when specifically relevant to the question AND it exists in the Available Calculators list
3. When suggesting a calculator, COPY THE EXACT SLUG VALUE from the Available Calculators list - do NOT modify it, do NOT remove spaces or parentheses: [CALCULATOR:exact-slug-with-spaces:Display Name]
   Example: If the list shows "Body Mass Index (BMI) (slug: Body Mass Index (BMI))", use [CALCULATOR:Body Mass Index (BMI):Body Mass Index]
4. IMPORTANT: Only suggest calculators that are actually listed in "Available Calculators" above
5. If user asks about recents/favorites, reference the context above
6. Use plain text formatting (no asterisks or markdown)
7. ALWAYS end your response with 3 follow-up questions in this exact format on a new line:
[SUGGESTIONS:Question 1?|Question 2?|Question 3?]`;

    const apiUrl = `${API_BASE}/api/chat`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userInput,
        context: systemContext,
        recents: recents.slice(0, 5),
        favorites: favorites,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    let aiText = data.response;

    console.log('Raw AI response:', aiText);

    aiText = aiText.replace(/\*\*/g, '').replace(/\*/g, '');

    const calculatorMatch = aiText.match(/\[CALCULATOR:([^:]+):([^\]]+)\]/);
    console.log('Calculator match:', calculatorMatch);

    const suggestionsMatch = aiText.match(/\[SUGGESTIONS:([^\]]+)\]/);
    console.log('Suggestions match:', suggestionsMatch);

    if (suggestionsMatch) {
      const newSuggestions = suggestionsMatch[1]
        .split('|')
        .map((q: string) => q.trim());
      console.log('New suggestions:', newSuggestions);
      setSuggestedQuestions(newSuggestions);
    } else {
      console.warn('No suggestions found in AI response');
    }

    aiText = aiText
      .replace(/\[CALCULATOR:[^:]+:[^\]]+\]/g, '')
      .replace(/\[SUGGESTIONS:[^\]]+\]/g, '')
      .trim();

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: aiText,
      timestamp: new Date(),
      calculatorSlug: calculatorMatch ? calculatorMatch[1] : undefined,
      calculatorName: calculatorMatch ? calculatorMatch[2] : undefined,
    };
  };

  const handleOpenCalculator = (slug?: string, name?: string) => {
    if (slug) {
      router.push(`/calculation/${slug}` as any);
    }
  };

  const handleShowInfo = () => {
    router.push('/screens/about');
  };

  const clearChatHistory = async () => {
    try {
      await AsyncStorage.removeItem('chat_history');
      setMessages([]);
      setSuggestedQuestions([
        'Which calculator should I use?',
        'Show my recent calculations',
        'Show my favorites',
        'Explain BMI calculation',
      ]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShowInfo}
            activeOpacity={0.7}
          >
            <Ionicons
              name='information-circle-outline'
              size={24}
              color='#616f89'
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Clinicalc AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              Ask about formulas, scores, and clinical parameters.
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={clearChatHistory}
              activeOpacity={0.7}
              disabled={messages.length === 0}
            >
              <Ionicons
                name='trash-outline'
                size={22}
                color={messages.length === 0 ? '#D1D5DB' : '#616f89'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.messagesContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name='chatbubbles-outline' size={64} color='#D1D5DB' />
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptySubtitle}>
                Ask me anything about medical calculations
              </Text>
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.type === 'user' && styles.messageWrapperUser,
              ]}
            >
              <View style={styles.messageInner}>
                <View
                  style={[
                    styles.messageBubble,
                    message.type === 'user'
                      ? styles.messageBubbleUser
                      : styles.messageBubbleAssistant,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.type === 'user' && styles.messageTextUser,
                    ]}
                  >
                    {message.content}
                  </Text>

                  {message.calculatorSlug && (
                    <TouchableOpacity
                      style={styles.calculatorButton}
                      onPress={() =>
                        handleOpenCalculator(
                          message.calculatorSlug,
                          message.calculatorName
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.calculatorButtonText}>
                        Open Calculator
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text
                  style={[
                    styles.timestamp,
                    message.type === 'user' && styles.timestampUser,
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={styles.messageWrapper}>
              <View style={styles.messageInner}>
                <View
                  style={[styles.messageBubble, styles.messageBubbleAssistant]}
                >
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <ScrollView
            horizontal
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
            showsHorizontalScrollIndicator={false}
          >
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestedQuestion(question)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputWrapper}>
            <View style={styles.inputField}>
              <TextInput
                style={styles.textInput}
                placeholder='Ask a clinical question…'
                placeholderTextColor='#9CA3AF'
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                blurOnSubmit={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              activeOpacity={0.7}
              disabled={!inputText.trim()}
            >
              <Ionicons name='send' size={20} color='#ffffff' />
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            For educational support only, not a substitute for clinical
            judgment.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.8)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#111318',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    marginTop: 2,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    justifyContent: 'flex-end',
    minHeight: '100%',
  },
  emptyState: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingVertical: 60,
  },
  messagesContentEmpty: {
    justifyContent: 'center',
    // alignItems: 'center',
    minHeight: 0,
    flexGrow: 1,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#111318',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#616f89',
    marginTop: 8,
  },
  messageWrapper: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  messageWrapperUser: {
    alignItems: 'flex-end',
  },
  messageInner: {
    maxWidth: '80%',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleAssistant: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleUser: {
    backgroundColor: '#135bec',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
    marginTop: 4,
    marginLeft: 4,
  },
  timestampUser: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 4,
  },
  calculatorButton: {
    marginTop: 12,
    backgroundColor: '#135bec',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  calculatorButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  inputContainer: {
    backgroundColor: '#f6f6f8',
    // paddingBottom: 8,
  },
  suggestionsContainer: {
    maxHeight: 48,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    height: 48,
  },
  suggestionChip: {
    alignContent: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 8,
  },
  inputField: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    // paddingVertical: 12,
    minHeight: 48,
    maxHeight: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textInput: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#111318',
    maxHeight: 76,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#135bec',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#135bec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowColor: '#D1D5DB',
  },
});
