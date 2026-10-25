import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import { LoopScene } from '../loopHero/LoopScene';
import { LoopControls } from '../loopHero/LoopControls';
import {
  LOOP_DEFAULTS,
  loadLoopParams,
  saveLoopParams,
  type LoopParams,
} from '../loopHero/loopParams';
import './loop-hero.css';

export function LoopHeroPage() {
  const [params, setParams] = useState<LoopParams>(LOOP_DEFAULTS);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const [locked, setLocked] = useState(false);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    setParams(loadLoopParams());
  }, []);

  useEffect(() => {
    saveLoopParams(params);
  }, [params]);

  const update = (next: LoopParams) => {
    if (locked) return;
    setParams(next);
  };

  return (
    <>
      <Link to="/" className="loop-back">
        Back to site
      </Link>
      <LoopScene params={params} paramsRef={paramsRef} reduce={reduce} />
      <LoopControls
        value={params}
        onChange={update}
        locked={locked}
        onLockedChange={setLocked}
      />
    </>
  );
}
