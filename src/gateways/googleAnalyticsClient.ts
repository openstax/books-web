// tslint:disable:max-classes-per-file

import { assertWindow } from '../app/utils';

interface Command {
  name: string;
  params: any[];
}

class PendingCommand {
  public command: Command;
  public savedAt: Date;

  constructor(command: Command, savedAt: Date = new Date()) {
    this.command = command;
    this.savedAt = savedAt;
  }

  public queueTime() {
    return (new Date()).getTime() - this.savedAt.getTime();
  }
}

class GoogleAnalyticsClient {
  private trackerNames: string[] = [];
  private pendingCommands: PendingCommand[] = [];

  public gaProxy(commandName: string, ...params: any[]) {
    const command: Command = {name: commandName, params};

    if (this.isReadyForCommands()) {
      this.commandEachTracker(command);
    } else {
      this.saveCommandForLater(command);
    }
  }

  public setUserId(id: string) {
    this.gaProxy('set', 'userId', id);
  }

  public unsetUserId() {
    this.gaProxy('set', 'userId', undefined);
  }

  public trackPageView(path: string) {
    this.gaProxy('send', 'pageview', path);
  }

  public trackEvent(category: string, action: string, label?: string, value?: number) {
    // This method takes optional arguments and wraps a call to `gaProxy`.  If we passed
    // the optional arguments on to gaProxy, it'd get `undefined`s some of the time for
    // those arguments.  We mock the ga method inside `gaProxy` and do things like expect
    // it to be called with the arguments passed to `trackEvent`.  So that the "optionalness"
    // of these arguments jives with the expectations we set on the `ga` mock, we make sure
    // to only pass on to `gaProxy` the arguments that are provided to `trackEvent`.  If this
    // doesn't make sense put all arguments in the `args` arrow below and watch the tests explode.

    const args: any[] = [];
    if (label) { args.push(label); }
    if (value) { args.push(value); }

    this.gaProxy('send', 'event', category, action, ...args);
  }

  public setTrackingIds(ids: string[]) {
    // Ignore tracking ID changes for the moment
    if (this.trackerNames.length > 0) { return; }

    for (const id of ids) {
      // Build a tracker for each ID, use the ID as the basis of the
      // tracker name (must be alphanumeric)
      const trackerName = 't' + id.replace( /[^a-z0-9]+/ig, '' );
      this.trackerNames.push(trackerName);
      this.ga('create', id, 'auto', trackerName);
    }

    this.flushPendingCommands();
  }

  private saveCommandForLater(command: Command) {
    this.pendingCommands.push(new PendingCommand(command));
  }

  private flushPendingCommands() {
    for (const pendingCommand of this.pendingCommands) {
      this.commandEachTracker(pendingCommand.command, pendingCommand.queueTime());
    }
    this.pendingCommands = [];
  }

  private commandEachTracker(command: Command, queueTime: number = 0) {
    for (const trackerName of this.trackerNames) {
      this.ga(trackerName + '.set', 'queueTime', queueTime);
      this.ga(trackerName + '.' + command.name, ...command.params);
    }
  }

  private isReadyForCommands() {
    return (this.trackerNames.length > 0);
  }

  // The real, low-level Google Analytics function
  private ga(commandName: string, ...params: any[]) {
    return assertWindow().ga(commandName, ...params);
  }

}

const singleton = new GoogleAnalyticsClient();

export { GoogleAnalyticsClient };
export default singleton;
