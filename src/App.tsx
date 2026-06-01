import { useRef, useState } from 'react';
import { TitleScreen } from '@/components/TitleScreen';
import { StorySelect } from '@/components/StorySelect';
import { RoleSelect } from '@/components/RoleSelect';
import { AvatarEditor } from '@/components/AvatarEditor';
import { GameScreen } from '@/components/GameScreen';
import { ProcurementHub } from '@/components/ProcurementHub';
import { PwaReloadPrompt } from '@/components/PwaReloadPrompt';
import { DEFAULT_AVATAR, type AvatarConfig } from '@/lib/avatar';
import type { Gender } from '@/lib/storage';
import type { Role, Entry, Track } from '@/lib/journey';
import {
  loadSessions,
  createSession,
  setActive,
  getSession,
  type Session,
} from '@/lib/sessions';
import { randomName } from '@/lib/names';

type Screen = 'title' | 'story' | 'role' | 'editor' | 'game';

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
  const [track, setTrack] = useState<Track>('cafe');
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [entry, setEntry] = useState<Entry>('tour');
  const avatarChanges = useRef(0);

  // Begin creating a brand-new session: fresh draft → story select.
  const startNewSession = () => {
    setAvatar(DEFAULT_AVATAR);
    setName(randomName());
    setGender(undefined);
    setTrack('cafe');
    setRole(undefined);
    setEntry('tour');
    avatarChanges.current = 0;
    setScreen('story');
  };

  // Choose the story: the café track adds a role step; Einkauf skips to the editor.
  const chooseStory = (t: Track) => {
    setTrack(t);
    setScreen(t === 'cafe' ? 'role' : 'editor');
  };

  const finishRole = (r: Role, e: Entry) => {
    setRole(r);
    setEntry(e);
    setScreen('editor');
  };

  // Finish the editor → persist the new session and play it.
  const finishEditor = () => {
    const session = createSession({
      name: name.trim() || 'Gast',
      avatar,
      gender,
      track,
      role: track === 'cafe' ? role : undefined,
      entry: track === 'cafe' ? entry : undefined,
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
      setTrack(s.track ?? 'cafe');
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
      {screen === 'story' && <StorySelect onChoose={chooseStory} />}
      {screen === 'role' && <RoleSelect onDone={finishRole} />}
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
      {screen === 'game' && playingId && track === 'einkauf' && (
        <ProcurementHub
          sessionId={playingId}
          avatar={avatar}
          name={name || 'Gast'}
          onExit={exitToTitle}
        />
      )}
      {screen === 'game' && playingId && track !== 'einkauf' && (
        <GameScreen
          sessionId={playingId}
          avatar={avatar}
          name={name || 'Gast'}
          onExit={exitToTitle}
        />
      )}
      <PwaReloadPrompt />
    </div>
  );
}

export type { Session };
export default App;
