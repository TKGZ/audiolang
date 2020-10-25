import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import hanzi from "hanzi";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'


enum Modes {
  QUESTION = "question",
  ANSWER = "answer",
  WAIT = "wait"
}

const INTERVAL = 2 * 1000


function App() {
  const [mode, setMode] = useState(Modes.WAIT);
  const [count, setCount] = useState(1);
  const [question, setQuestion] = useState(hanzi.getCharacterInFrequencyListByPosition(111));

  const { transcript, resetTranscript } = useSpeechRecognition()

  useEffect(() => {
    hanzi.start()
    setQuestion(getNextQuestion)
  }, [])

  const getNextQuestion = () => {
    const n = Math.floor(Math.random() * 1500);
    // console.log(hanzi.getCharacterFrequency('热'))
    return (hanzi.getCharacterInFrequencyListByPosition(n))
  }

  useInterval(() => {
    console.log("interval", count)
    setCount(count + 1)
    setQuestion(getNextQuestion())
  }, INTERVAL)

  return (
    <div className="App">
      <p>
        This is the question:
      </p>
      <p>
        Chinese: {question && question.character}
      </p>
      <p>
        Meaning: {question && question.meaning}
      </p>
      <button onClick={() => { SpeechRecognition.startListening() }}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <p>{transcript}</p>
    </div>
  );
}

export default App;

const r = () => { };

function useInterval(
  callback: () => void,
  delay: number | null | false,
  immediate?: boolean
) {
  const savedCallback = useRef(r);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Execute callback if immediate is set.
  useEffect(() => {
    if (!immediate) return;
    if (delay === null || delay === false) return;
    savedCallback.current();
  }, [immediate]);

  // Set up the interval.
  useEffect(() => {
    if (delay === null || delay === false) return undefined;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export const timeToSeconds = (time: number): number => {
  return ((time - (time % 1000)) / 1000);
}