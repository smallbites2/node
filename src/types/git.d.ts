declare module 'git' {
  export interface GitInfo {
    dirty: boolean;
    raw: string;
    hash: string;
    distance: null | number;
    tag: null | string;
    semver: null;
    suffix: string;
    semverString: null | string;
  }

  const git: GitInfo;
  export default git;
}
