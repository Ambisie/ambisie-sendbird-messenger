import _ from 'lodash';
import { isEmpty } from './utils';
import { SendBirdAction } from './SendBirdAction';
import { ChatLeftMenu } from './ChatLeftMenu';
import { Chat } from './Chat';
import { Spinner } from './components/Spinner';
import { body, UPDATE_INTERVAL_TIME } from './const';
import { SendBirdConnection } from './SendBirdConnection';
import { SendBirdEvent } from './SendBirdEvent';
import { LeftListItem } from './components/LeftListItem';
import { setAppState } from './AppState';

const view = _.template(`
  <div class="ambisie-sendbird-messenger">
    <div class="body">
      <div class="body-left">
        <div class="body-left-list">
          <div class="chat-type">
            <div>CHATS</div>
            <div>
              <div class="icon-create-chat" id="group_chat_add"></div>
            </div>
          </div>
          <div id="group_list" class="chat-list chat-list-group">
            <div id="default_item_group" class="default-item">Start by inviting user to create a channel.</div>
          </div>
        </div>
        <div class="body-left-bottom" id="user_info">
          <div class="bottom-nickname">
            <div class="nickname-title">username</div>
            <div class="nickname-content"></div>
          </div>
        </div>
      </div>
      <div class="body-center"></div>
    </div>
  </div>`);

let instance = null;

class Messenger {

  static getInstance() {
    return instance;
  }

  constructor({ sendBirdAppId, userAccessToken, userId, nickname, targetUserId, containerEl, placeholderAvatarUrl, noMessagePlaceholder }) {
    if (instance) {
      return instance;
    }

    instance = this;
    setAppState({ currentUserId: userId, currentUserNickname: nickname, placeholderAvatarUrl, noMessagePlaceholder });

    this.containerEl = containerEl;
    this.containerEl.innerHTML = view();

    this.bodyEl   = this.containerEl.querySelector('.body');

    this.sb       = new SendBirdAction(sendBirdAppId);
    this.chatLeft = new ChatLeftMenu(this.bodyEl);
    this.chat     = new Chat(this.bodyEl);

    this.connect({ userAccessToken, userId, nickname, targetUserId });
  }


  isPhone() {
    const type = window.getComputedStyle(this.bodyEl).getPropertyValue('--device-type');
    return _.trim(type) === 'phone';
  }


  connect({ userAccessToken, userId, nickname, targetUserId }) {
    if (isEmpty(userId) || isEmpty(nickname)) {
      alert('Messenger UserID and Nickname are required.');
    }

    Spinner.start(this.bodyEl);

    this.sb
      .connect(userId, userAccessToken, nickname)
      .then(user => {
        this.chatLeft.updateUserInfo(user);
        this.createConnectionHandler();
        this.createChannelEvent();
        this.updateGroupChannelTime();
        this.chatLeft.getGroupChannelList(true).then(() => {
          if(targetUserId) {
            this.sb.findOrCreateGroupChannelWithUsers([ targetUserId ])
              .then((channel) => {
                this.chat.render(channel.url, false);
                if(!this.isPhone()) this.chatLeft.show();

                // HACK: allow queued background events to be processed in the event loop
                _.defer(() => {
                  this.chatLeft.activeChannelItem(channel.url);
                });
              });
          } else {
            if(this.chatLeft.hasChannels()) this.chatLeft.show();
          }
        });
      })
      .catch((e) => {
        console.error("ERROR:", e);
        alert('Messenger connection failed.');
      });
  }

  createConnectionHandler() {
    const connectionManager = new SendBirdConnection();
    connectionManager.onReconnectStarted = () => {
      Spinner.start(body);
      console.log('[SendBird JS SDK] Reconnect : Started');
      connectionManager.channel = this.chat.channel;
    };
    connectionManager.onReconnectSucceeded = () => {
      console.log('[SendBird JS SDK] Reconnect : Succeeded');
      this.chatLeft.clear();
      this.chatLeft.updateUserInfo(SendBirdAction.getInstance().getCurrentUser());
      this.chatLeft.getGroupChannelList(true);
      Spinner.start(body);
      this.chat.refresh(connectionManager.channel);
    };
    connectionManager.onReconnectFailed = () => {
      console.log('[SendBird JS SDK] Reconnect : Failed');
      connectionManager.remove();
      console.error('Messenger Reconnect Failed...');
    };
  }

  createChannelEvent() {
    const channelEvent = new SendBirdEvent();
    channelEvent.onChannelChanged = channel => {
      if(channel._autoMarkAsRead) {
        channel.markAsRead();
      }
      this.chatLeft.updateItem(channel, true);
    };
    channelEvent.onUserEntered = (openChannel, user) => {
      if (SendBirdAction.getInstance().isCurrentUser(user)) {
        const handler = () => {
          this.chat.render(openChannel.url);
          ChatLeftMenu.getInstance().activeChannelItem(openChannel.url);
        };
        const item = new LeftListItem({ channel: openChannel, handler });
        this.chatLeft.addOpenChannelItem(item.element);
        this.chat.render(openChannel.url);
      }
    };
    channelEvent.onUserJoined = (groupChannel, user) => {
      const handler = () => {
        this.chat.render(groupChannel.url, false);
        ChatLeftMenu.getInstance().activeChannelItem(groupChannel.url);
      };
      const item = new LeftListItem({ channel: groupChannel, handler });
      this.chatLeft.addGroupChannelItem(item.element);
      this.chat.updateChatInfo(groupChannel);

      if(this.isPhone()) this.chatLeft.hide();
    };
    channelEvent.onUserLeft = (groupChannel, user) => {
      if (SendBirdAction.getInstance().isCurrentUser(user)) {
        this.chatLeft.removeGroupChannelItem(groupChannel.url);
      } else {
        this.chatLeft.updateItem(groupChannel);
      }
      this.chat.updateChatInfo(groupChannel);
    };
    channelEvent.onChannelHidden = groupChannel => {
      this.chatLeft.removeGroupChannelItem(groupChannel.url);
    };
  }

  updateGroupChannelTime() {
    setInterval(() => {
      LeftListItem.updateLastMessageTime();
    }, UPDATE_INTERVAL_TIME);
  }
}

export default Messenger;
