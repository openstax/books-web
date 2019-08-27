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

  public setUserId(id: string | undefined) {
    this.gaProxy('set', 'userId', id);
  }

  public trackPageView(path: string) {
    this.gaProxy('send', 'pageview', path);
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
