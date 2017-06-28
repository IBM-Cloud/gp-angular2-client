export class GpCredentials {
    url: string;
    instanceId: string;
    userId: string;
    password: string;
}

export class GpConfig {
    defaultBundle: string;
    defaultLang: string;
    creds: GpCredentials;
    uselocal: boolean;
    localpath: string;
    localfallbackLang: string;
}
