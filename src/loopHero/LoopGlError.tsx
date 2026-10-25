import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Keep a failed WebGL tree from blanking the whole lab page. */
export class LoopGlError extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('Loop WebGL failed', error, info.componentStack);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
