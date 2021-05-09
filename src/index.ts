/**
 * An abstract representation of a `File` that conforms to the KIPR API.
 */
export interface File {
  /**
   * The UUID of the `File`.
   */
  readonly handle: File.Handle;

  /**
   * The path of the `File`.
   */
  path(): Promise<string>;

  /**
   * Move the `File` to a new location.
   * 
   * @param path The new location (/ is the project root)
   */
  move(path: string): Promise<void>;

  /**
   * Read the contents of the `File` as a string.
   */
  read(): Promise<string>;

  /**
   * Update the contents of the `File` as a string.
   * 
   * @param contents The new contents of the `File`.
   */
  update(contents: string): Promise<void>;

  /**
   * Closes the `File`. This MUST be called once the `File` is no longer in use, as
   * certain implementations are stateful.
   */
  close(): Promise<void>;
}

export namespace File {
  export type Handle = string;

  /**
   * File metadata.
   */
  export class Brief<F extends File = File, V extends Version<F> = Version<F>> {
    private version_: V;
    private path_: string;
    private handle_: Handle;

    /**
     * The `Version` this `File` belongs to.
     */
    get version() { return this.version_; }

    /**
     * The path of the `File`.
     */
    get path() { return this.path_; }

    /**
     * The UUID of the `File`.
     */
    get handle() { return this.handle_; }

    open() {
      return this.version_.files.open(this.handle_);
    }
  }
}

/**
 * An abstract representation of a project version that conforms to the KIPR API.
 */
export interface Version<F extends File = File> {
  /**
   * The version UUID
   */
  handle: Version.Handle;
  files: Version.Files<F>;
}

export namespace Version {
  export type Handle = string;

  /**
   * Version metadata
   */
  export class Brief<F extends File, V extends Version<F>, P extends Project<F, V> = Project<F, V>> {
    private project_: P;
    private name_: string;
    private description_?: string;
    private handle_: Handle;

    /**
     * The project this `Version` belongs to.
     */
    get project() { return this.project_; }

    /**
     * The UUID of the `Version`.
     */
    get handle() { return this.handle_; }

    /**
     * The name of this `Version`.
     */
    get name() { return this.name_; }

    /**
     * The description of this `Version`.
     */
    get description() { return this.description_; }

    /**
     * Open the version referenced by this `Brief`.
     * 
     * @returns The opened `Version`
     */
    open() {
      return this.project_.versions.open(this.handle_);
    }

    /**
     * Restore the version referenced by this `Brief`.
     * 
     * @param name An optional new name for the restored version
     * @param description An optional new description for the restored version
     * @returns The restored `Version`
     */
    restore(name?: string, description?: string) {
      return this.project_.versions.restore(this.handle_, name, description);
    }
  }

  /**
   * File-related methods
   */
  export interface Files<F extends File = File> {
    /**
     * Get all files associated with the version.
     * 
     * @returns A list of file "briefs" that give information without opening the file
     */
    list(): Promise<File.Brief<F, Version<F>>[]>;

    /**
     * Create a new file in the version at the given path.
     * 
     * @param path The file's path (/ is the project root)
     */
    create(path: string): Promise<F>;

    /**
     * Open an existing file in the version at the given path.
     * 
     * @param path The file's path (/ is the project root)
     */
    open(path: string): Promise<F>;
  }
}

export interface Project<F extends File = File, V extends Version<F> = Version<F>> {
  /**
   * The project's UUID
   */
  handle: Project.Handle;

  /**
   * The project's name
   */
  name(): Promise<string>;

  /**
   * Version information and manipulation
   */
  versions: Project.Versions<F>;

  /**
   * Close a project. This method MUST be called once a
   * project is no longer in use, as certain implementations are stateful.
   */
  close(): Promise<void>;
}

export namespace Project {
  export type Handle = string;

  /**
   * Project metadata
   */
  export class Brief<
    F extends File = File,
    V extends Version<F> = Version<F>,
    P extends Project<F, V> = Project<F, V>,
    U extends User<F, V, P> = User<F, V, P>
  > {
    private user_: U;
    private name_: string;
    private handle_: Handle;

    constructor(handle: Handle, name: string, user: U) {
      this.user_ = user;
      this.name_ = name;
      this.handle_ = handle;
    }

    /**
     * The user this project belongs to
     */
    get user() { return this.user_; }

    /**
     * The project's name
     */
    get name() { return this.name_; }

    /**
     * The project's UUID
     */
    get handle() { return this.handle_; }

    /**
     * Open the `Project` referenced by this `Brief`.
     * 
     * @returns The opened `Project`
     */
    open() {
      return this.user_.projects.open(this.handle_);
    }
  }

  /**
   * Version-related methods
   */
  export interface Versions<F extends File = File, V extends Version<F> = Version<F>> {
    /**
     * Get all versions associated with the project. This list is in descending order; The first version
     * in the list is HEAD.
     * 
     * @returns A list of version "briefs" that give information without opening the version
     */
    list(): Promise<Version.Brief<F, V, Project<F, V>>[]>;

    /**
     * Create a new version based on the current HEAD
     * 
     * @param name User-defined name of the version
     * @param description Optional user-defined description of the version
     * 
     * @returns The new version
     */
    create(name: string, description?: string): Promise<V>;

    /**
     * Restore a version to HEAD. This pushes a new version to the version stack
     * without editing the referenced version.
     * 
     * @param handle The version UUID
     * @param name An optional new name for the restored version
     * @param description An optional new description for the restored version
     *
     * @returns The restored `Version` that is now HEAD
     */
    restore(handle: Version.Handle, name?: string, description?: string): Promise<V>;

    /**
     * Open a version for reading and writing
     * 
     * @param handle The version UUID
     * 
     * @returns The opened `Version`
     */
    open(handle: Version.Handle): Promise<V>;
  }
}

/**
 * An abstract representation of a user that conforms to the KIPR API.
 */
export interface User<F extends File = File, V extends Version<F> = Version<F>, P extends Project<F, V> = Project<F, V>> {
  /**
   * The user's UUID
   */
  handle: User.Handle;
  
  /**
   * The username
   */
  name(): Promise<string>;

  /**
   * The user's email address
   */
  email(): Promise<string>;

  /**
   * Update the user's email address
   * @param email The new email address of the user
   */
  setEmail(email: string): Promise<void>;

  projects: User.Projects<F, V, P>;
  organizations: User.Organizations<F, V, P>;
}

export namespace User {
  export type Handle = string;


  export class Brief<
    F extends File = File,
    V extends Version<F> = Version<F>,
    P extends Project<F, V> = Project<F, V>,
    U extends User<F, V, P> = User<F, V, P>,
    C extends Client<F, V, P, U> = Client<F, V, P, U>
  > {
    private client_: C;
    private handle_: User.Handle;

    get client() { return this.client_; }
    get handle() { return this.handle_; }

    
  }

  /**
   * Project-related methods
   */
  export interface Projects<
    F extends File = File,
    V extends Version<F> = Version<F>,
    P extends Project<F, V> = Project<F, V>
  > {
    /**
     * Get all projects associated with the `User`
     * 
     * @return A list of project "briefs" that give information without opening the project
     */
    list(): Promise<Project.Brief<F, V, P, User<F, V, P>>[]>;

    /**
     * Create a new `Project`.
     * 
     * @param name The project's name
     */
    create(name: string): Promise<P>;

    /**
     * Open an existing `Project.
     * 
     * @param handle The project UUID
     */
    open(handle: Project.Handle): Promise<P>;

    /**
     * Delete an existing `Project`.
     * 
     * @param handle The project UUID
     */
    delete(handle: Project.Handle): Promise<void>;
  }

  /**
   * Organization-related methods
   */
  export interface Organizations<
    F extends File = File,
    V extends Version<F> = Version<F>,
    P extends Project<F, V> = Project<F, V>
  > {
    /**
     * Get all projects associated with the `User`
     * 
     * @return A list of project "briefs" that give information without opening the project
     */
    list(): Promise<Organization.Brief<F, V, P, User<F, V, P>>[]>;

    /**
     * Create a new `Organization`. The user that created the organization
     * will be the administrator.
     * 
     * @param name The organizations's name
     */
    create(name: string, description?: string): Promise<Organization<F, V, P>>;

    /**
     * Open an existing `Organization`.
     * 
     * @param handle The organization's UUID
     */
    open(handle: Organization.Handle): Promise<Organization<F, V, P>>;

    /**
     * Delete an existing `Organization`, including all of its resources.
     * 
     * @param handle The organization UUID
     */
    delete(handle: Organization.Handle): Promise<void>;
  }
}

export interface Organization<
  F extends File = File,
  V extends Version<F> = Version<F>,
  P extends Project<F, V> = Project<F, V>,
  U extends User<F, V, P> = User<F, V, P>
> {
  /**
   * The organization's name
   */
  name(): Promise<string>;

  /**
   * The organization's description
   */
  description(): Promise<string>;

  users: Organization.Users<F, V, P, U>;
}

export namespace Organization {
  export type Handle = string;

  /**
   * Organization metadata
   */
  export class Brief<
    F extends File = File,
    V extends Version<F> = Version<F>,
    P extends Project<F, V> = Project<F, V>,
    U extends User<F, V, P> = User<F, V, P>,
    O extends Organization<F, V, P, U> = Organization<F, V, P, U>,
    C extends Client<F, V, P, U, O> = Client<F, V, P, U, O>
  > {
    private client_: C;
    private handle_: Handle;

    get client() { return this.client_; }
    get handle() { return this.handle_; }
  }

  /**
   * Project-related methods
   */
  export interface Projects<
    F extends File = File,
    V extends Version<F> = Version<F>,
    P extends Project<F, V> = Project<F, V>,
    U extends User<F, V, P> = User<F, V, P>
  > {
    /**
     * Get all projects associated with the `Organization`
     * 
     * @return A list of project "briefs" that give information without opening the project
     */
    list(): Promise<Project.Brief<F, V, P, U>[]>;

    /**
     * Create a new `Project`.
     * 
     * @param name The project's name
     */
    create(name: string): Promise<P>;

    /**
     * Open an existing `Project.
     * 
     * @param handle The project UUID
     */
    open(handle: Project.Handle): Promise<P>;

    /**
     * Delete an existing `Project`.
     * 
     * @param handle The project UUID
     */
    delete(handle: Project.Handle): Promise<void>;
  }

  /**
   * User-related methods
   */
  export interface Users<
    F extends File = File,
    V extends Version<F> = Version<F>,
    P extends Project<F, V> = Project<F, V>,
    U extends User<F, V, P> = User<F, V, P>
  > {
    /**
     * The users that belong to this organization
     * 
     * @returns Information about each user
     */
    list(): Promise<User.Brief<F, V, P, U>[]>;

    /**
     * Add a user to the organization. This can fail if the user doesn't
     * have sufficient permissions.
     * 
     * @param handle The user's UUID
     */
    add(handle: User.Handle): Promise<void>;

    /**
     * Remove a user from the organization. This can fail if the user doesn't
     * have sufficient permissions.
     * 
     * @param handle The user's UUID
     */
    remove(handle: User.Handle): Promise<void>;
  }
}

/**
 * An abstract representation of a client that conforms to the KIPR API.
 * 
 * @template F The underlying type used to represent files
 * @template V The underlying type used to represent versions
 * @template P The underlying type used to represent projects
 * @template U The underlying type used to represent users
 */
export interface Client<
  F extends File = File,
  V extends Version<F> = Version<F>,
  P extends Project<F, V> = Project<F>,
  U extends User<F, V, P> = User<F, V, P>,
  O extends Organization<F, V, P, U> = Organization<F, V, P, U>
> {

  /**
   * Login with the given credentials, providing access to the user's resources
   * 
   * @param username The user's username
   * @param password The user's password
   * 
   * @return A user instance
   */
  login(username: string, password: string): Promise<U>;
}

export { default as Rest } from './Rest';
export * from './Rest';

export { default as Socket } from './Socket';
export * from './Socket';


