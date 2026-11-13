import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const WORDS = [
  'APPLE', 'BRAVE', 'CHAIR', 'DREAM', 'EARTH', 'FLAME', 'GRAPE', 'HOUSE',
  'JUICE', 'LEMON', 'MOUSE', 'NIGHT', 'OCEAN', 'PLANT', 'QUEEN', 'RIVER',
  'SMILE', 'TIGER', 'WATER', 'ZEBRA', 'BREAD', 'CLOUD', 'DANCE', 'EAGLE',
  'FIELD', 'GHOST', 'HEART', 'LIGHT', 'MUSIC', 'PIZZA',
];

const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

type Status = 'correct' | 'present' | 'absent';

const COLORS = {
  background: '#121213',
  empty: '#565758',
  key: '#818384',
  correct: '#538d4e',
  present: '#b59f3b',
  absent: '#3a3a3c',
};

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function scoreGuess(guess: string, answer: string): Status[] {
  const result: Status[] = Array(WORD_LENGTH).fill('absent');
  const remaining = answer.split('');

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      remaining[i] = '';
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] !== 'correct') {
      const index = remaining.indexOf(guess[i]);
      if (index !== -1) {
        result[i] = 'present';
        remaining[index] = '';
      }
    }
  }
  return result;
}

export default function HomeScreen() {
  const [answer, setAnswer] = useState(pickWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [message, setMessage] = useState('');

  const won = guesses.includes(answer);
  const lost = !won && guesses.length >= MAX_GUESSES;
  const gameOver = won || lost;

  // Best known status for each letter, used to color the keyboard
  const keyStatus: Record<string, Status> = {};
  for (const guess of guesses) {
    const scores = scoreGuess(guess, answer);
    guess.split('').forEach((letter, i) => {
      const old = keyStatus[letter];
      const now = scores[i];
      if (old === 'correct') return;
      if (old === 'present' && now === 'absent') return;
      keyStatus[letter] = now;
    });
  }

  function pressLetter(letter: string) {
    if (gameOver || current.length >= WORD_LENGTH) return;
    setMessage('');
    setCurrent(current + letter);
  }

  function pressDelete() {
    if (gameOver) return;
    setMessage('');
    setCurrent(current.slice(0, -1));
  }

  function pressEnter() {
    if (gameOver) return;
    if (current.length < WORD_LENGTH) {
      setMessage('Not enough letters');
      return;
    }
    setGuesses([...guesses, current]);
    setCurrent('');
  }

  function newGame() {
    setAnswer(pickWord());
    setGuesses([]);
    setCurrent('');
    setMessage('');
  }

  function renderRow(rowIndex: number) {
    let letters = '';
    let statuses: Status[] | null = null;

    if (rowIndex < guesses.length) {
      letters = guesses[rowIndex];
      statuses = scoreGuess(letters, answer);
    } else if (rowIndex === guesses.length) {
      letters = current;
    }

    return (
      <View key={rowIndex} style={styles.row}>
        {Array.from({ length: WORD_LENGTH }).map((_, i) => {
          const status = statuses ? statuses[i] : null;
          return (
            <View
              key={i}
              style={[
                styles.tile,
                status
                  ? { backgroundColor: COLORS[status], borderColor: COLORS[status] }
                  : null,
              ]}
            >
              <Text style={styles.tileText}>{letters[i] ?? ''}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  function renderKey(label: string, onPress: () => void, wide = false) {
    const status = keyStatus[label];
    return (
      <Pressable
        key={label}
        onPress={onPress}
        style={[
          styles.key,
          wide && styles.keyWide,
          status ? { backgroundColor: COLORS[status] } : null,
        ]}
      >
        <Text style={styles.keyText}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORD GUESS</Text>

      <View style={styles.grid}>
        {Array.from({ length: MAX_GUESSES }).map((_, i) => renderRow(i))}
      </View>

      <Text style={styles.message}>
        {won ? 'You got it! 🎉' : lost ? `The word was ${answer}` : message}
      </Text>

      {gameOver && (
        <Pressable style={styles.newGame} onPress={newGame}>
          <Text style={styles.newGameText}>Play again</Text>
        </Pressable>
      )}

      <View style={styles.keyboard}>
        {KEY_ROWS.map((rowLetters, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {rowIndex === 2 && renderKey('ENTER', pressEnter, true)}
            {rowLetters.split('').map((l) => renderKey(l, () => pressLetter(l)))}
            {rowIndex === 2 && renderKey('⌫', pressDelete, true)}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: 70,
  },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold', letterSpacing: 4 },
  grid: { marginTop: 24 },
  row: { flexDirection: 'row', justifyContent: 'center' },
  tile: {
    width: 56,
    height: 56,
    margin: 3,
    borderWidth: 2,
    borderColor: COLORS.empty,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  message: { color: 'white', fontSize: 18, height: 28, marginTop: 12 },
  newGame: {
    backgroundColor: COLORS.correct,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  newGameText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  keyboard: { position: 'absolute', bottom: 40 },
  key: {
    width: 30,
    height: 48,
    margin: 3,
    borderRadius: 5,
    backgroundColor: COLORS.key,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWide: { width: 48 },
  keyText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
});