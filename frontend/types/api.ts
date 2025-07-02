// Based on openapi.yaml
    // This can be auto-generated in a real project

    export interface AuthRegister {
      username: string;
      email: string;
      password?: string;
    }

    export interface AuthLogin {
      identity: string; // username or email
      password?: string;
    }
