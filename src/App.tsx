import { useRef, useState } from 'react';
import { TitleScreen } from '@/components/TitleScreen';
import { AvatarEditor } from '@/components/AvatarEditor';
import { GameScreen } from '@/components/GameScreen';
import { PwaReloadPrompt } from '@/components/PwaReloadPrompt';
import { DEFAULT_AVATAR, type AvatarConfig } from '@/lib/avatar';
import type { Gender } from '@/lib/storage';
import {
  loadSessions,
  createSession,
  setActive,
  getSession,
  type Session,
} from '@/lib/sessions';
import { randomName } from '@/lib/names';

type Screen = 'title' | 'editor' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('title');

  // Multi-session save model: a list of playthroughs + the active one.
  const [{ sessions, activeId }, setSessionsState] = useState(() => {
    const s = loadSessions();
    return { sessions: s.sessions, activeId: s.activeId };
  });
  const refreshSessions = () => {
    const s = loadSessions();
    setSessionsState({ sessions: s.sessions, activeId: s.activeId });
  };

  // Draft identity edited in the AvatarEditor before a session is created.
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [name, setName] = useState<string>(() => randomName());
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const avatarChanges = useRef(0);

  // Begin creating a brand-new session: fresh draft → editor.
  const startNewSession = () => {
    setAvatar(DEFAULT_AVATAR);
    setName(randomName());
    setGender(undefined);
    avatarChanges.current = 0;
    setScreen('editor');
  };

  // Finish the editor → persist the new session and play it.
  const finishEditor = () => {
    const session = createSession({
      name: name.trim() || 'Gast',
      avatar,
      gender,
      avatarChanges: avatarChanges.current,
    });
    refreshSessions();
    setActiveSessionAndPlay(session.id);
  };

  const setActiveSessionAndPlay = (id: string) => {
    setActive(id);
    const s = getSession(id);
    if (s) {
      setAvatar(s.avatar);
      setName(s.name);
      setGender(s.gender);
    }
    refreshSessions();
    setScreen('game');
  };

  const exitToTitle = () => {
    refreshSessions();
    setScreen('title');
  };

  const playingId = activeId ?? '';

  return (
    <div className="w-full">
      {screen === 'title' && (
        <TitleScreen
          sessions={sessions}
          onContinue={(id) => setActiveSessionAndPlay(id)}
          onNewSession={startNewSession}
        />
      )}
      {screen === 'editor' && (
        <AvatarEditor
          config={avatar}
          name={name}
          gender={gender}
          onChange={(cfg) => {
            avatarChanges.current += 1;
            setAvatar(cfg);
          }}
          onName={setName}
          onGender={(g) => {
            avatarChanges.current += 1;
            setGender(g);
          }}
          onDone={finishEditor}
        />
      )}
      {screen === 'game' && playingId && (
        <GameScreen
          sessionId={playingId}
          avatar={avatar}
          name={name || 'Gast'}
          gender={gender}
          onExit={exitToTitle}
        />
      )}
      <PwaReloadPrompt />
    </div>
  );
}

export type { Session };
export default App;
