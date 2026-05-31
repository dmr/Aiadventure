import { useEffect, useState } from 'react';
import { TitleScreen } from '@/components/TitleScreen';
import { AvatarEditor } from '@/components/AvatarEditor';
import { GameScreen } from '@/components/GameScreen';
import { PwaReloadPrompt } from '@/components/PwaReloadPrompt';
import { DEFAULT_AVATAR, type AvatarConfig } from '@/lib/avatar';
import { loadPrefs, savePrefs, type Gender } from '@/lib/storage';
import { randomName } from '@/lib/names';

type Screen = 'title' | 'editor' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('title');

  // Load saved prefs synchronously on first render (lazy initializers run once),
  // falling back to defaults + a witty starter name. This avoids a hydration
  // effect that would briefly render defaults before the saved values land.
  const [initial] = useState(loadPrefs);
  const [avatar, setAvatar] = useState<AvatarConfig>(initial.avatar ?? DEFAULT_AVATAR);
  const [name, setName] = useState<string>(() => initial.name ?? randomName());
  const [gender, setGender] = useState<Gender | undefined>(initial.gender);

  // Persist on any change.
  useEffect(() => {
    savePrefs({ avatar, name, gender });
  }, [avatar, name, gender]);

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
      <PwaReloadPrompt />
    </div>
  );
}

export default App;
