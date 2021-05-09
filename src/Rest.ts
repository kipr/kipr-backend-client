import {
  File,
  Project,
  User,
  Client,
  Version
} from './index';

export class RestFile implements File {
  private version_: RestVersion;
  private handle_: File.Handle;

  get version() { return this.version_; }
  
  get handle() { return this.handle_; }

  constructor(handle: File.Handle, version: RestVersion) {
    this.handle_ = handle;
    this.version_ = version;
  }

  async path() {
    return '';
  }

  async move(path: string) {

  }

  async read() {
    return '';
  }

  async update(contents: string) {

  }

  async close() {

  }
}

export class RestVersion implements Version<RestFile> {
  private handle_: Version.Handle;
  private project_: RestProject;
  private files_ = new RestVersion.Files(this);

  get handle() { return this.handle_; }
  get project() { return this.project_; }
  get files() { return this.files_; }

  constructor(handle: Version.Handle, project: RestProject) {
    this.handle_ = handle;
    this.project_ = project;
  }
}

export namespace RestVersion {
  export class Files implements Version.Files<RestFile> {
    private version_: RestVersion;

    constructor(version: RestVersion) {
      this.version_ = version;
    }

    async list(): Promise<File.Brief<RestFile>[]> {
      return [];
    }

    async create(path: string) {
      return new RestFile('', this.version_);
    }

    async open(handle: File.Handle) {
      return new RestFile(handle, this.version_);
    }
  }
}

export class RestProject implements Project<RestFile, RestVersion> {
  private user_: RestUser;
  private handle_: Project.Handle;
  private name_?: string;

  private versions_ = new RestProject.Versions(this);

  get user() { return this.user_; }
  get handle() { return this.handle_; }

  constructor(handle: Project.Handle, user: RestUser) {
    this.handle_ = handle;
    this.user_ = user;
  }

  async name() {
    if (name) return this.name_;
    return '';
  }

  get versions() { return this.versions_; }

  async close() {

  }
}

export namespace RestProject {
  export class Versions implements Project.Versions<RestFile> {
    private project_: RestProject;
    
    constructor(project: RestProject) {
      this.project_ = project;
    }

    async list() {
      return [];
    }

    async create(name: string, description?: string) {
      return new RestVersion('', this.project_);
    }

    async restore(handle: Version.Handle, name?: string, description?: string) {
      return new RestVersion(handle, this.project_);

    }

    async open(handle: Version.Handle) {
      return new RestVersion(handle, this.project_);
    }
  }
}

export class RestUser implements User<RestFile, RestVersion, RestProject> {
  private client_: RestClient;
  private token_: string;
  private projects_ = new RestUser.Projects(this);

  get client() { return this.client_; }
  get projects() { return this.projects_; }

  constructor(token: string, client: RestClient) {
    this.token_ = token;
    this.client_ = client;
  }
}

export namespace RestUser {
  export class Projects implements User.Projects<RestFile, RestVersion, RestProject> {
    private user_: RestUser;
    
    constructor(user: RestUser) {
      this.user_ = user;
    }

    async list() {
      return [];
    }

    async create(name: string) {
      return new RestProject('', this.user_);
    }

    async open(handle: Project.Handle) {
      return new RestProject(handle, this.user_);
    }

    async delete(handle: Project.Handle) {

    }
  }
}

export class RestClient implements Client<RestFile, RestVersion, RestProject, RestUser> {
  static readonly DEFAULT_URL = "https://api.kipr.org";

  private url_: string;
  get url() { return this.url_; }

  constructor(url = RestClient.DEFAULT_URL) {
    this.url_ = url;
  }

  async login(username: string, password: string) {
    return new RestUser('', this);
  }
}

export default RestClient;


