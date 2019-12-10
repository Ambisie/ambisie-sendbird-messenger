import { LeftListItem } from './components/LeftListItem';
import { ACTIVE_CLASSNAME, DISPLAY_BLOCK, DISPLAY_NONE } from './const';
import { addClass, appendToFirst, errorAlert, isScrollBottom, isUrl, protectFromXSS, removeClass } from './utils';
import { Spinner } from './components/Spinner';
import { OpenChannelList } from './components/OpenChannelList';
import { SendBirdAction } from './SendBirdAction';
import { UserList } from './components/UserList';
import { Chat } from './Chat';

let instance = null;

class ChatLeftMenu {
  constructor(bodyEl) {
    if (instance) {
      return instance;
    }
    this.bodyEl = bodyEl;
    this.groupChannelCreateBtn = bodyEl.querySelector('#group_chat_add');

    this.openChannelDefaultItem = bodyEl.querySelector('#default_item_open');
    this.groupChannelList = bodyEl.querySelector('#group_list');
    this.groupChannelList.addEventListener('scroll', () => {
      if (isScrollBottom(this.groupChannelList)) {
        this.getGroupChannelList();
      }
    });
    this.groupChannelDefaultItem = bodyEl.querySelector('#default_item_group');
    this._addEvent();
    instance = this;
  }

  _addEvent() {
    this.groupChannelCreateBtn.addEventListener('click', () => {
      UserList.getInstance().render();
    });
  }


  updateUserInfo(user) {
    const userInfoEl = document.querySelector('#user_info');
    const nicknameEl = userInfoEl.querySelectorAll('.nickname-content')[0];
    nicknameEl.innerHTML = protectFromXSS(user.nickname);
  }

  /**
   * Item
   */
  getChannelItem(channelUrl) {
    const groupItems = this.groupChannelList.querySelectorAll("." + LeftListItem.getItemRootClassName());
    const checkList = [...groupItems];
    for (let i = 0; i < checkList.length; i++) {
      if (checkList[i].id === channelUrl) {
        return checkList[i];
      }
    }
    return null;
  }

  activeChannelItem(channelUrl) {
    const groupItems = this.groupChannelList.querySelectorAll("." + LeftListItem.getItemRootClassName());
    const checkList = [...groupItems];
    for (let i = 0; i < checkList.length; i++) {
      checkList[i].id === channelUrl
        ? addClass(checkList[i], ACTIVE_CLASSNAME)
        : removeClass(checkList[i], ACTIVE_CLASSNAME);
    }
  }

  getItem(elementId) {
    const groupChannelItems = this.groupChannelList.querySelectorAll("." + LeftListItem.getItemRootClassName());
    for (let i = 0; i < groupChannelItems.length; i++) {
      if (groupChannelItems[i].id === elementId) {
        return groupChannelItems[i];
      }
    }

    return null;
  }

  updateItem(channel, isFirst = false) {
    const item = this.getItem(channel.url);
    const handler = () => {
      Chat.getInstance().render(channel.url, false);
      ChatLeftMenu.getInstance().activeChannelItem(channel.url);
    };
    const newItem = new LeftListItem({ channel, handler });
    const parentNode = this.groupChannelList;
    if (isFirst) {
      if (item) {
        parentNode.removeChild(item);
      }
      appendToFirst(parentNode, newItem.element);
    } else {
      parentNode.replaceChild(newItem.element, item);
    }
    LeftListItem.updateUnreadCount();
  }

  /**
   * Group Channel
   */
  getGroupChannelList(isInit = false) {
    Spinner.start(this.bodyEl);
    return SendBirdAction.getInstance()
      .getGroupChannelList(isInit)
      .then(groupChannelList => {
        this.toggleGroupChannelDefaultItem(groupChannelList);
        groupChannelList.forEach(channel => {
          const handler = () => {
            Chat.getInstance().render(channel.url, false);
            ChatLeftMenu.getInstance().activeChannelItem(channel.url);
          };
          const item = new LeftListItem({ channel, handler });
          this.groupChannelList.appendChild(item.element);
          LeftListItem.updateUnreadCount();
        });
        Spinner.remove();
      })
      .catch(error => {
        errorAlert(error.message);
      });
  }

  toggleGroupChannelDefaultItem(items) {
    if (items) {
      this.groupChannelDefaultItem.style.display = items && items.length > 0 ? DISPLAY_NONE : DISPLAY_BLOCK;
    } else {
      this.groupChannelList.querySelectorAll("." + LeftListItem.getItemRootClassName()).length > 0
        ? (this.groupChannelDefaultItem.style.display = DISPLAY_NONE)
        : (this.groupChannelDefaultItem.style.display = DISPLAY_BLOCK);
    }
  }

  addGroupChannelItem(element, isFirst = false) {
    const listItems = this.groupChannelList.childNodes;
    let isExist = false;
    for (let i = 0; i < listItems.length; i++) {
      if (listItems[i].id === element.id) {
        isExist = true;
      }
    }
    if (isExist) {
      SendBirdAction.getInstance()
        .getChannel(element.id, false)
        .then(channel => {
          this.updateItem(channel);
        })
        .catch(error => {
          errorAlert(error.message);
        });
    } else {
      if (isFirst) {
        appendToFirst(this.groupChannelList, element);
      } else {
        this.groupChannelList.appendChild(element);
      }
    }
    LeftListItem.updateUnreadCount();
    this.toggleGroupChannelDefaultItem();
  }

  removeGroupChannelItem(elementId) {
    const removeEl = this.getItem(elementId);
    if (removeEl) {
      this.groupChannelList.removeChild(removeEl);
    }
    this.toggleGroupChannelDefaultItem();
  }

  clear() {
    const groupItems = this.groupChannelList.querySelectorAll("." + LeftListItem.getItemRootClassName());
    const removeItems = [...groupItems];
    for (let i = 0; i < removeItems.length; i++) {
      removeItems[i].parentNode.removeChild(removeItems[i]);
    }

    this.toggleGroupChannelDefaultItem();
  }

  static getInstance() {
    return new ChatLeftMenu();
  }
}

export { ChatLeftMenu };
