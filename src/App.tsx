import { useEffect, useState } from 'react';
import { TitleScreen } from '@/components/TitleScreen';
import { AvatarEditor } from '@/components/AvatarEditor';
import { GameScreen } from '@/components/GameScreen';
import { DEFAULT_AVATAR, type AvatarConfig } from '@/lib/avatar';
import { loadPrefs, savePrefs, type Gender } from '@/lib/storage';
import { randomName } from '@/lib/names';

type Screen = 'title' | 'editor' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('title');

  // Load saved prefs on mount (or fall back to defaults + a witty starter name)
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs.avatar) setAvatar(prefs.avatar);
    if (prefs.name) setName(prefs.name);
    else setName(randomName());
    if (prefs.gender) setGender(prefs.gender);
    setHydrated(true);
  }, []);

  // Persist on any change (after hydration so we don't overwrite saved data
  // with the initial defaults during the first render)
  useEffect(() => {
    if (!hydrated) return;
    savePrefs({ avatar, name, gender });
  }, [avatar, name, gender, hydrated]);

  return (
    <div className="min-h-screen w-full">
      {screen === 'title' && (
        <TitleScreen onStart={() => setScreen('editor')} />
      )}
      {screen === 'editor' && (
        <AvatarEditor
          config={avatar}
          name={name}
          gender={gender}
          onChange={setAvatar}
          onName={setName}
          onGender={setGender}
          onDone={() => setScreen('game')}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          avatar={avatar}
          name={name || 'Gast'}
          onExit={() => setScreen('title')}
        />
      )}
    </div>
  );
}

export default App;
