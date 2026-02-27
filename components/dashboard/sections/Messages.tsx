'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '../shared/EmptyState';
import { dashboardService } from '@/lib/services/dashboardService';
import type { Message } from '@/types/dashboard';

export const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    const data = await dashboardService.getMessages();
    setMessages(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-100 rounded-xl h-96 animate-pulse" />
        <div className="lg:col-span-2 bg-gray-100 rounded-xl h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Messages</h2>

      {messages.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No messages yet"
          description="Your client messages will appear here"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <Card padding="none" className="lg:col-span-1">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-primary/5' : ''
                  } ${!message.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {message.client.avatar ? (
                      <img
                        src={message.client.avatar}
                        alt={message.client.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold">
                          {message.client.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {message.client.name}
                        </p>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {message.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Message Thread */}
          <Card padding="lg" className="lg:col-span-2">
            {selectedMessage ? (
              <div className="space-y-4">
                {/* Message Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  {selectedMessage.client.avatar ? (
                    <img
                      src={selectedMessage.client.avatar}
                      alt={selectedMessage.client.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {selectedMessage.client.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {selectedMessage.client.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedMessage.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg ${
                    selectedMessage.isFromClient ? 'bg-gray-100' : 'bg-primary/10 ml-auto max-w-md'
                  }`}>
                    <p className="text-gray-900">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Reply Form */}
                <div className="pt-4 border-t border-gray-200">
                  <textarea
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p>Select a message to view conversation</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};