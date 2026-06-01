import { useState } from 'react';
import { TitleScreen } from '@/components/TitleScreen';
import { StorySelect } from '@/components/StorySelect';
import { AvatarEditor } from '@/components/AvatarEditor';
import { GameScreen } from '@/components/GameScreen';
import { ProcurementHub } from '@/components/ProcurementHub';
import { PwaReloadPrompt } from '@/components/PwaReloadPrompt';
import { randomAvatar, type AvatarConfig } from '@/lib/avatar';
import type { Gender } from '@/lib/storage';
import type { Track } from '@/lib/journey';
import {
  loadSessions,
  createSession,
  setActive,
  getSession,
  setIdentity,
  type Session,
} from '@/lib/sessions';
import { randomName } from '@/lib/names';

type Screen = 'title' | 'story' | 'game';

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

  // Active player's identity (mirrors the active session; editable any time).
  const [avatar, setAvatar] = useState<AvatarConfig>(() => randomAvatar(Date.now() & 0xffff));
  const [name, setName] = useState<string>(() => randomName());
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [track, setTrack] = useState<Track>('cafe');
  const [editingAvatar, setEditingAvatar] = useState(false);

  // New session → pick the story, then jump straight in with a random avatar
  // (no forced role/avatar step; the avatar can be tweaked any time from the top).
  const startNewSession = () => setScreen('story');

  const chooseStory = (t: Track) => {
    const session = createSession({ track: t }); // random name/avatar by default
    refreshSessions();
    playSession(session.id);
  };

  const playSession = (id: string) => {
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

  // In-game avatar editor (overlay): save → persist to the session; cancel → revert.
  const saveAvatar = () => {
    if (activeId) {
      setIdentity(activeId, { avatar, name: name.trim() || 'Gast', gender });
      refreshSessions();
    }
    setEditingAvatar(false);
  };
  const cancelAvatar = () => {
    const s = getSession(activeId);
    if (s) { setAvatar(s.avatar); setName(s.name); setGender(s.gender); }
    setEditingAvatar(false);
  };

  const playingId = activeId ?? '';

  return (
    <div className="w-full">
      {screen === 'title' && (
        <TitleScreen
          sessions={sessions}
          onContinue={(id) => playSession(id)}
          onNewSession={startNewSession}
        />
      )}
      {screen === 'story' && <StorySelect onChoose={chooseStory} />}
      {screen === 'game' && playingId && track === 'einkauf' && (
        <ProcurementHub
          sessionId={playingId}
          avatar={avatar}
          name={name || 'Gast'}
          onExit={exitToTitle}
          onEditAvatar={() => setEditingAvatar(true)}
        />
      )}
      {screen === 'game' && playingId && track !== 'einkauf' && (
        <GameScreen
          sessionId={playingId}
          avatar={avatar}
          name={name || 'Gast'}
          onExit={exitToTitle}
          onEditAvatar={() => setEditingAvatar(true)}
        />
      )}

      {editingAvatar && (
        <div className="fixed inset-0 z-[120] bg-background">
          <AvatarEditor
            config={avatar}
            name={name}
            gender={gender}
            onChange={setAvatar}
            onName={setName}
            onGender={setGender}
            onDone={saveAvatar}
            onClose={cancelAvatar}
            title="Avatar anpassen"
            doneLabel="Speichern"
          />
        </div>
      )}

      <PwaReloadPrompt />
    </div>
  );
}

export type { Session };
export default App;
