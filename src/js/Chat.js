import styles from '../scss/chat.scss';
import { createDivEl, errorAlert } from './utils';
import { getAppState } from './AppState';
import { SendBirdAction } from './SendBirdAction';
import { Spinner } from './components/Spinner';
import { ChatLeftMenu } from './ChatLeftMenu';
import { ChatTopMenu } from './components/ChatTopMenu';
import { ChatMain } from './components/ChatMain';
import { SendBirdChatEvent } from './SendBirdChatEvent';
import Messenger from './Messenger';

let instance = null;

class Chat {
  constructor(bodyEl) {
    if (instance) {
      return instance;
    }
    this.bodyEl       = bodyEl;
    this.targetEl     = this.bodyEl.querySelector('.body-center');
    this.channel      = null;
    this.element      = null;
    this.top          = null;
    this.emptyElement = this._createEmptyElement();
    this.render();
    instance = this;
  }

  _createEmptyElement() {
    const item = createDivEl({ className: styles['chat-empty'] });

    const content = createDivEl({ className: styles['empty-content'] });
    item.appendChild(content);

    const title = createDivEl({ className: styles['content-title'], content: 'PRIVATE MESSAGES' });
    content.appendChild(title);
    const image = createDivEl({ className: styles['content-image'] });
    content.appendChild(image);
    const desc = createDivEl({
      className: styles['content-desc'],
      content: getAppState().noMessagePlaceholder || 'Find storytellers and make contact'
    });
    content.appendChild(desc);
    return item;
  }

  renderEmptyElement() {
    this._removeChatElement();
    this.targetEl.appendChild(this.emptyElement);
    return Promise.resolve();
  }

  _removeEmptyElement() {
    if (this.targetEl.contains(this.emptyElement)) {
      this.targetEl.removeChild(this.emptyElement);
    }
  }

  _createChatElement(channel) {
    this.element = createDivEl({ className: styles['chat-root'] });

    this.top = new ChatTopMenu(channel);
    this.element.appendChild(this.top.element);

    this.main = new ChatMain(channel, this.bodyEl);
  }

  _addEventHandler() {
    const channelEvent = new SendBirdChatEvent();
    channelEvent.onMessageReceived = (channel, message) => {
      if (this.channel.url === channel.url) {
        this.main.renderMessages([message], false);
      }
    };
    channelEvent.onMessageUpdated = (channel, message) => {
      if (this.channel.url === channel.url) {
        this.main.renderMessages([message], false);
      }
    };
    channelEvent.onMessageDeleted = (channel, messageId) => {
      if (this.channel.url === channel.url) {
        this.main.removeMessage(messageId, false);
      }
    };

    if (this.channel.isGroupChannel()) {
      channelEvent.onReadReceiptUpdated = groupChannel => {
        if (this.channel.url === groupChannel.url) {
          this.main.updateReadReceipt();
        }
      };
      channelEvent.onTypingStatusUpdated = groupChannel => {
        if (this.channel.url === groupChannel.url) {
          this.main.updateTyping(groupChannel.getTypingMembers());
        }
      };
    }
  }

  _renderChatElement(channelUrl, isOpenChannel = true) {
    Spinner.start(this.bodyEl);
    const sendbirdAction = SendBirdAction.getInstance();
    this._removeEmptyElement();
    this._removeChatElement();
    ChatLeftMenu.getInstance().activeChannelItem(channelUrl);
    return sendbirdAction
      .getChannel(channelUrl, isOpenChannel)
      .then(channel => {
        this.channel = channel;
        this._addEventHandler();
        this._createChatElement(this.channel);
        this.targetEl.appendChild(this.element);
        sendbirdAction
          .getMessageList(this.channel, true)
          .then(messageList => {
            this.main.renderMessages(messageList);
            if (this.channel.isGroupChannel()) {
              sendbirdAction.markAsRead(this.channel);
            }
            Spinner.remove();
          })
          .catch(error => {
            errorAlert(error.message);
          });
      })
      .catch(error => {
        errorAlert(error.message);
      });
  }

  _removeChatElement() {
    const chatElements = this.targetEl.getElementsByClassName(styles['chat-root']);
    Array.prototype.slice.call(chatElements).forEach(chatEl => {
      chatEl.parentNode.removeChild(chatEl);
    });
  }

  updateChatInfo(channel) {
    if (this.channel && this.channel.url === channel.url) {
      if (this.top) {
        this.top.updateTitle(channel);
      }
      if (this.main) {
        this.main.updateMenu(channel);
      }
    }
  }

  render(channelUrl, isOpenChannel = true) {
    if(Messenger.getInstance().isPhone()) ChatLeftMenu.getInstance().hide();
    return channelUrl ? this._renderChatElement(channelUrl, isOpenChannel) : this.renderEmptyElement();
  }

  refresh(channel) {
    this._removeEmptyElement();
    this._removeChatElement();
    this.renderEmptyElement();
    const reconnectChannel = channel ? channel : this.channel;
    if (reconnectChannel) {
      this.render(reconnectChannel.url, reconnectChannel.isOpenChannel());
    }
  }

  static getInstance() {
    return new Chat();
  }
}

export { Chat };
