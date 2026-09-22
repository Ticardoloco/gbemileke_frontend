/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export interface Session {
  _id: string;
  title: string;
  cost: number;
  date: string;
  isClosed: boolean;
}

export interface Card {
  _id: string;
  specialty: string;
  billing: {
    sessions: Session[];
  };
}

export function useCheckClosedSession(cards: Card[]) {
  const [closedSessionToPrompt, setClosedSessionToPrompt] = useState<{
    session: Session;
    specialty: string;
  } | null>(null);

  useEffect(() => {
    if (!cards || cards.length === 0) return;

    // Get array of session IDs user has already given feedback for
    const promptedSessions: string[] = JSON.parse(
      localStorage.getItem("prompted_closed_sessions") || "[]"
    );

    for (const card of cards) {
      const sessions = card.billing?.sessions || [];
      
      // Find the first closed session that has NOT been prompted yet
      const closedSession = sessions.find(
        (session) => session.isClosed && !promptedSessions.includes(session._id)
      );

      if (closedSession) {
        setClosedSessionToPrompt({
          session: closedSession,
          specialty: card.specialty,
        });
        break; // Stop loop after finding one unprompted closed session
      }
    }
  }, [cards]);

  const markSessionAsPrompted = (sessionId: string) => {
    const promptedSessions: string[] = JSON.parse(
      localStorage.getItem("prompted_closed_sessions") || "[]"
    );

    if (!promptedSessions.includes(sessionId)) {
      promptedSessions.push(sessionId);
      localStorage.setItem("prompted_closed_sessions", JSON.stringify(promptedSessions));
    }
    setClosedSessionToPrompt(null);
  };

  return {
    closedSessionToPrompt,
    markSessionAsPrompted,
  };
}