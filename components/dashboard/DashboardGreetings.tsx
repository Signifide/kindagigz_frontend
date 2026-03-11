'use client';

import React, { useState, useEffect } from 'react';
import { Professional } from '@/types/auth';

interface DashboardGreetingProps {
  professional: Professional;
}

export const DashboardGreeting: React.FC<DashboardGreetingProps> = ({ professional }) => {
  const [greeting, setGreeting] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    const firstName = professional.user.first_name;

    // Greetings based on time of day
    if (hour < 12) {
      setGreeting(`Good Morning, ${firstName}`);
      setMessage('Ready to make today productive?');
    } else if (hour < 17) {
      setGreeting(`Good Afternoon, ${firstName}`);
      setMessage("Let's keep the momentum going!");
    } else if (hour < 21) {
      setGreeting(`Good Evening, ${firstName}`);
      setMessage('Time to wrap up and review your day.');
    } else {
      setGreeting(`Working Late, ${firstName}?`);
      setMessage("Don't forget to rest!");
    }

    if (professional.total_reviews > 5 && parseFloat(professional.average_rating) >= 4.5) {
      const messages = [
        `Your ${professional.average_rating}⭐ rating is impressive!`,
        `${professional.total_reviews} happy clients trust you!`,
        'Your excellent service speaks for itself!',
      ];
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
  }, [professional]);

  return (
    <div className="bg-linear-to-r from-primary to-primary/80 text-white py-8 px-6 rounded-2xl mb-2 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold mb-2">{greeting} 👋</h1>
        <p className="text-white/90 text-sm md:text-md lg:text-lg">{message}</p>
        
        {/* Quick Stats */}
        {/* <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/70 text-xs mb-1">Total Jobs</p>
            <p className="text-2xl font-bold">{professional.completed_jobs}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/70 text-xs mb-1">Rating</p>
            <p className="text-2xl font-bold">{parseFloat(professional.average_rating).toFixed(1)} ⭐</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/70 text-xs mb-1">Reviews</p>
            <p className="text-2xl font-bold">{professional.total_reviews}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/70 text-xs mb-1">Response Time</p>
            <p className="text-xl font-bold">{professional.response_time}</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};