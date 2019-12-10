import _ from 'lodash';
import { isEmpty, addClass, removeClass } from './utils';
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

class Messenger {
  constructor({ sendBirdAppId, userAccessToken, userId, nickname, targetUserId, containerEl, placeholderAvatarUrl, noMessagePlaceholder }) {
    setAppState({ currentUserId: userId, currentUserNickname: nickname, placeholderAvatarUrl, noMessagePlaceholder });

    this.containerEl = containerEl;
    this.containerEl.innerHTML = view();

    this.bodyEl   = this.containerEl.querySelector('.body');

    this.sb       = new SendBirdAction(sendBirdAppId);
    this.chatLeft = new ChatLeftMenu(this.bodyEl);
    this.chat     = new Chat(this.bodyEl);

    this.connect({ userAccessToken, userId, nickname, targetUserId });
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
        this.chatLeft.getGroupChannelList(true).then(() => this.updateLeftMenuVisibility());

        if(targetUserId) {
          this.sb.findOrCreateGroupChannelWithUsers([ targetUserId ])
            .then((channel) => {
              this.chat.render(channel.url, false);
            });
        }
      })
      .catch((e) => {
        console.error("ERROR:", e);
        alert('Messenger connection failed.');
      });
  }

  updateLeftMenuVisibility() {
    const leftMenuEl = this.bodyEl.querySelector('.body-left');

    leftMenuEl.querySelectorAll('.list-item').length > 0
      ? addClass(leftMenuEl, 'show')
      : removeClass(leftMenuEl, 'show');
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
      alert('Messenger Reconnect Failed...');
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
