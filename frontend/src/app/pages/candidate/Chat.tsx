import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { MobileSidebar } from '../../components/MobileSidebar';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ScoreBar } from '../../components/ScoreBar';
import { Send, Bot, User } from 'lucide-react';

const initialMessages = [
  {
    id: 1,
    role: 'ai',
    content: "Hello! I'm your AI recruiter assistant. I'll ask you some questions to better understand your experience and skills. Let's start with your React expertise. Can you describe a complex state management challenge you've solved?",
    timestamp: '10:30 AM',
  },
  {
    id: 2,
    role: 'user',
    content: "In my e-commerce project, I had to manage cart state across multiple components while handling async operations. I implemented a custom Context + useReducer pattern with optimistic updates and error handling.",
    timestamp: '10:32 AM',
  },
  {
    id: 3,
    role: 'ai',
    content: "Great answer! That shows solid architectural thinking. Can you explain how you handled the optimistic updates and what you'd do differently if you were building it today?",
    timestamp: '10:33 AM',
  },
];

export function CandidateChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        role: 'user',
        content: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="candidate" />
      <MobileSidebar userType="candidate" />

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border bg-card px-4 lg:px-8 py-6 pt-20 lg:pt-6">
            <h1 className="text-2xl font-semibold">AI Recruiter Interview</h1>
            <p className="text-sm text-muted-foreground mt-1">Conversational skill assessment</p>
          </div>

          <div className="flex-1 overflow-auto p-4 lg:p-8 space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>

          <div className="border-t border-border bg-card p-6">
            <div className="flex gap-3">
              <Input
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-80 border-l border-border bg-card p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Real-Time Scores</h3>
            <div className="space-y-4">
              <ScoreBar score={85} label="Communication" />
              <ScoreBar score={78} label="Depth of Knowledge" />
              <ScoreBar score={92} label="Engagement" />
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold mb-3">Interview Progress</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Questions Asked</span>
                <span className="font-medium">8 / 12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">15 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Topics Covered</span>
                <span className="font-medium">3 / 5</span>
              </div>
            </div>
          </div>

          <Button className="w-full" variant="outline">End Interview</Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: any }) {
  const isAI = message.role === 'ai';

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
        isAI ? 'bg-primary/10' : 'bg-secondary/10'
      }`}>
        {isAI ? (
          <Bot className="h-5 w-5 text-primary" />
        ) : (
          <User className="h-5 w-5 text-secondary" />
        )}
      </div>
      <div className={`flex-1 max-w-2xl ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div className={`rounded-lg p-4 ${
          isAI ? 'bg-muted' : 'bg-primary text-primary-foreground'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{message.timestamp}</p>
      </div>
    </div>
  );
}
