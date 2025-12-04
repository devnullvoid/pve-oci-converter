export interface ContainerConfig {
  image: string;
  tag: string;
  name?: string;
  cpus: number;
  memory: number; // in MB
  storage: string;
  diskSize: number; // in GB
  netInterface: string;
  ip: string; // 'dhcp' or CIDR
  gateway?: string;
  env: Record<string, string>;
  ports: { host: number; container: number; protocol: string }[];
  volumes: { host: string; container: string }[];
  command?: string[];
  entrypoint?: string[];
  restartPolicy?: string;
  privileged: boolean;
  features?: {
    nesting?: boolean;
    keyctl?: boolean;
    fuse?: boolean;
  };
}

export interface ProxmoxConnection {
  host: string;
  port: number;
  node: string;
  user: string;
  tokenName: string;
  tokenSecret: string;
  sslVerify: boolean;
}

export interface DeploymentLog {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export enum AppStep {
  INPUT = 0,
  CONFIGURE = 1,
  DEPLOY = 2
}