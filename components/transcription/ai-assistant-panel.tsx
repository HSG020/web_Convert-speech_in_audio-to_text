'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User, Sparkles, MessageSquare } from 'lucide-react';

interface Segment {
  speaker: string;
  text: string;
  startTime: number;
  id?: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiAssistantPanelProps {
  transcript: Segment[];
}

const QUICK_QUESTIONS = [
  '总结音频内容',
  '提取关键信息',
  '分析主要观点',
  '识别重要数据',
];

export function AiAssistantPanel({ transcript }: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || transcript.length === 0) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-8).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText.trim(),
          transcript,
          conversationHistory
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI回答失败');
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI聊天错误:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `抱歉，出现了错误：${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(question);
  };

  const handleQuickQuestion = (quickQ: string) => {
    sendMessage(quickQ);
  };

  if (transcript.length === 0) {
    return (
      <Card className="h-[580px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600">
            <Sparkles className="h-5 w-5" />
            AI智能助手
          </CardTitle>
          <CardDescription>AI Assistant</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">转录完成后即可开始AI问答</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[580px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-600">
          <Sparkles className="h-5 w-5" />
          AI智能助手
        </CardTitle>
        <CardDescription>AI Assistant</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 space-y-4 min-h-0">
        {/* 快捷问题 */}
        {messages.length === 0 && (
          <div className="flex-shrink-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">快捷问题：</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_QUESTIONS.map((q, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(q)}
                  disabled={isLoading}
                  className="text-xs h-8"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 对话历史 - 使用固定高度并且可滚动 */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">开始提问吧！</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <Bot className="h-5 w-5 text-purple-500 mt-0.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-lg p-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <User className="h-5 w-5 text-blue-500 mt-0.5" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <Bot className="h-5 w-5 text-purple-500 mt-0.5" />
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">AI正在思考...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* 输入框 - 固定在底部 */}
        <div className="flex-shrink-0 space-y-2">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="请输入你的问题..."
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button type="submit" disabled={isLoading || !question.trim()} size="sm">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* 清空对话 */}
          {messages.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessages([])}
                disabled={isLoading}
                className="text-xs text-muted-foreground h-6"
              >
                清空对话
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 