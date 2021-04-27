const admin = require("firebase-admin");
const fetch = require("node-fetch");
const functions = require("firebase-functions");

admin.initializeApp({
  databaseURL: "http:///imagefluxhouse?ns=imagefluxhouse",
});
const ref = admin.database().ref();

let debug_listenercounter = 0;

exports.processSignUp = functions.auth.user().onCreate((user) => {
  if (!user.displayName) {
    user.displayName =
      randomNames[Math.floor(Math.random() * Math.floor(randomNames.length))];
    admin.auth().updateUser(user.uid, { displayName: user.displayName });
  }
  if (!user.photoURL) {
    user.photoURL =
      "http://localhost:2000" +
      "/icons/" +
      randomIcons[Math.floor(Math.random() * Math.floor(randomIcons.length))] +
      ".png";
    admin.auth().updateUser(user.uid, { photoURL: user.photoURL });
  }
  return saveUser(user.uid, user.displayName, user.photoURL, user.email);
});

exports.CreateRoom = functions.https.onCall((data, context) => {
  const roomName =
    randomTopics[Math.floor(Math.random() * Math.floor(randomTopics.length))];
  return createRoom(context.auth.uid, roomName);
});

exports.ListRoom = functions.https.onCall((data, context) => {
  return context.auth && listRoom(context.auth.uid);
});

exports.JoinRoom = functions.https.onCall((data, context) => {
  return joinRoom(context.auth.uid, data.roomId);
});

exports.LeaveRoom = functions.https.onCall((data, context) => {
  return leaveRoom(context.auth.uid, data.roomId);
});

exports.SetMute = functions.https.onCall((data, context) => {
  return setMute(context.auth.uid, data.roomId, data.mute);
});

exports.SetHand = functions.https.onCall((data, context) => {
  return setHand(context.auth.uid, data.roomId, data.hand);
});

exports.UpgradeUser = functions.https.onCall((data, context) => {
  return upgradeUser(context.auth.uid, data.roomId, data.userId, data.kind);
});

exports.AuthWebhook = functions.https.onRequest((req, res) => {
  console.error("auth_webhook", req.body);
  res.send({ allowed: true });
});

exports.EventWebhook = functions.https.onRequest(async (req, res) => {
  console.error("event_webhook", req.body);
  if (
    req.body.type === "connection.created" ||
    req.body.type === "connection.updated"
  ) {
    const connection_id = req.body.connection_id;
    // const client_id = req.body.client_id;
    const updates = {};
    updates["connections/" + connection_id] = req.body;
    console.error("connection.created", updates);
    ref.update(updates);
  } else if (req.body.type === "connection.destroyed") {
    const connection_id = req.body.connection_id;
    const userId = req.body.client_id;
    const updates = {};
    updates["connections/" + connection_id] = null;
    updates["users/" + userId + "/playlist_url"] = null;
    console.error("connection.destroyed", updates);
    ref.update(updates);
  } else if (req.body.type === "notify.playlist_url") {
    const userId = req.body.client_id;
    const updates = {};
    const roomId = (
      await ref.child("users/" + userId + "/roomId").once("value")
    ).val();
    if (roomId) {
      const IsSpeaker = (
        await ref.child("rooms/" + roomId + "/speakers/" + userId).once("value")
      ).val();
      console.error("IsSpeaker", !!IsSpeaker);
      if (IsSpeaker) {
        updates["rooms/" + roomId + "/speakers/" + userId + "/playlist_url"] =
          req.body.playlist_url;
      }
    }
    updates["users/" + userId + "/playlist_url"] = req.body;
    console.error("notify.playlist_url", updates);
    ref.update(updates);
  }
  res.end();
});

async function saveUser(userId, name, picture, email) {
  const updates = {};
  updates["users/" + userId + "/userId"] = userId;
  updates["users/" + userId + "/name"] = name;
  updates["users/" + userId + "/picture"] = picture;
  updates["users/" + userId + "/email"] = email;
  return ref.update(updates);
}

async function setMute(userId, roomId, mute) {
  const updates = {};
  const room = (await ref.child("rooms/" + roomId).once("value")).val();
  if (room) {
    const isSpeaker = Object.keys(room.speakers || {}).includes(userId);
    if (isSpeaker) {
      updates["rooms/" + roomId + "/speakers/" + userId + "/mute"] = mute;
      return ref.update(updates);
    }
  }
}

async function setHand(userId, roomId, hand) {
  const updates = {};
  const room = (await ref.child("rooms/" + roomId).once("value")).val();
  if (room) {
    const isListener = Object.keys(room.listeners || {}).includes(userId);
    if (isListener) {
      updates["rooms/" + roomId + "/listeners/" + userId + "/hand"] = hand;
      return ref.update(updates);
    }
  }
}

async function upgradeUser(userId, roomId, targetUserId, kind) {
  const updates = {};
  const room = (await ref.child("rooms/" + roomId).once("value")).val();
  if (room) {
    const isModerator = room.moderators?.includes(userId);
    if (isModerator || (userId === targetUserId && kind === "listener")) {
      const targetIsSpeaker = Object.keys(room.speakers || {}).includes(
        targetUserId
      );
      const targetIsListener = Object.keys(room.listeners || {}).includes(
        targetUserId
      );
      if (
        targetIsSpeaker &&
        kind === "listener" &&
        Object.keys(room.speakers || {}).length >= 2
      ) {
        const obj = JSON.parse(JSON.stringify(room.speakers[targetUserId]));
        obj.playlist_url = null;
        updates["rooms/" + roomId + "/listeners/" + targetUserId] = obj;
        updates["rooms/" + roomId + "/speakers/" + targetUserId] = null;
        return ref.update(updates);
      }
      if (targetIsListener && kind === "speaker") {
        const obj = JSON.parse(JSON.stringify(room.listeners[targetUserId]));
        updates["rooms/" + roomId + "/speakers/" + targetUserId] = obj;
        updates["rooms/" + roomId + "/listeners/" + targetUserId] = null;
        return ref.update(updates);
      }
    }
  }
}

async function leaveRoom(userId, roomId) {
  const updates = {};
  const room = (await ref.child("rooms/" + roomId).once("value")).val();
  if (room) {
    const isModerator = room.moderators?.includes(userId);
    const isSpeaker = Object.keys(room.speakers || {}).includes(userId);
    const isListener = Object.keys(room.listeners || {}).includes(userId);
    const existsOtherModerator = isModerator
      ? Object.keys(room.speakers || {}).some(
          (speakerUserId) =>
            speakerUserId != userId && room.moderators?.includes(speakerUserId)
        )
      : true;
    console.error("existsOtherModerator=", existsOtherModerator);
    if (isModerator && !existsOtherModerator) {
      updates["rooms/" + roomId] = null;
      Object.keys(room.speakers || {}).forEach((speakerUserId) => {
        updates["users/" + speakerUserId + "/roomId"] = null;
      });
      Object.keys(room.listeners || {}).forEach((listenerUserId) => {
        updates["users/" + listenerUserId + "/roomId"] = null;
      });
      // FIXME ImageFlux DeleteChannel
    } else {
      if (isListener) {
        updates["rooms/" + roomId + "/listeners/" + userId] = null;
      }
      if (isSpeaker) {
        updates["rooms/" + roomId + "/speakers/" + userId] = null;
      }
      updates["rooms/" + roomId + "/pictures/0"] = null;
      updates["rooms/" + roomId + "/pictures/1"] = null;
      const speakers = Object.keys(room.speakers || {});
      let pictureCount = 0;
      for (let i = 0; i < speakers.length && pictureCount < 2; i++) {
        const pictureUserId = speakers[i];
        if (pictureUserId != userId) {
          updates["rooms/" + roomId + "/pictures/" + pictureCount] =
            room.speakers[pictureUserId].picture || null;
          pictureCount++;
        }
      }
    }
  }
  updates["users/" + userId + "/roomId"] = null;
  return ref.update(updates);
}

async function joinRoom(userId, roomId) {
  const room = (await ref.child("rooms/" + roomId).once("value")).val();
  if (!room) {
    console.error("room not found", roomId);
    return false;
  }
  if ((room.speakers || {})[userId] || (room.listeners || {})[userId]) {
    console.error("user already joined*****");
    return false;
  }

  const user = (await ref.child("users/" + userId).once("value")).val();
  if (!user) {
    console.error("user not exists", userId);
    return false;
  }

  // FIXME 別ルームにジョイン済みの場合は拒否(クライアント側で確認ダイアログを出し、部屋を抜けてからジョインする)
  if (user.roomId && user.roomId != roomId) {
    console.error("user already joined other room *****");
    return false;
  }

  const roomUser = {
    roomId,
    userId,
    name: user.name || null,
    picture: user.picture || null,
  };
  const updates = {};
  if ((room.pictures || []).length < 2) {
    updates["rooms/" + roomId + "/pictures/1"] = user.picture || null;
  }
  debug_listenercounter++;
  if (debug_listenercounter & 1) {
    updates["rooms/" + roomId + "/speakers/" + userId] = roomUser;
  } else {
    updates["rooms/" + roomId + "/listeners/" + userId] = roomUser;
  }
  updates["users/" + userId + "/roomId"] = roomId;
  return ref.update(updates);
}

// eslint-disable-next-line no-unused-vars
async function listRoom(userId) {
  // FIXME 入室済みのルームを先頭に持ってくる
  // FIXME 全件ではなく、上位3件
  // FIXME フォローユーザーがいる部屋優先
  const snapshot = await ref.child("rooms").once("value");
  return snapshot.val();
}

async function createRoom(userId, roomName) {
  const user = (await ref.child("users/" + userId).once("value")).val();
  if (!user) {
    console.error("user not exists", userId);
    return;
  }
  const options = {
    hls: [{ durationSeconds: 2, startTimeOffset: -2, audio: { bps: 32000 } }],
    auth_webhook_url:
      "http://host.docker.internal:2002/imagefluxhouse/us-central1/AuthWebhook",
    event_webhook_url:
      "http://host.docker.internal:2002/imagefluxhouse/us-central1/EventWebhook",
  };
  // FIXME CreateChannelに失敗した場合の対処
  const channelInfo = await ImageFluxAPIInternal(
    "ImageFlux_20200316.CreateMultistreamChannelWithHLS",
    options
  );
  console.error("channelInfo", channelInfo);
  const roomId = ref.child("rooms").push().key;
  const roomUser = {
    roomId,
    userId,
    name: user.name || null,
    picture: user.picture || null,
  };
  const speakers = {};
  speakers[userId] = roomUser;
  const listeners = {};
  const pictures = [user.picture || null];
  const roomInfo = {
    roomId,
    name: roomName,
    userId,
    channelInfo,
    moderators: [userId],
    speakers,
    listeners,
    pictures,
  };
  const updates = {};
  updates["rooms/" + roomId] = roomInfo;
  updates["users/" + userId + "/roomId"] = roomId;
  return ref.update(updates);
}

async function ImageFluxAPIInternal(apiName, bodyobj) {
  const headers = {
    "Content-Type": "application/json",
    "X-Sora-Target": apiName,
    Authorization: "Bearer " + process.env.IMAGEFLUX_ACCESS_TOKEN,
  };
  try {
    const res = await fetch(process.env.IMAGEFLUX_API_ENDPOINT, {
      method: "POST",
      headers,
      body: typeof bodyobj === "string" ? bodyobj : JSON.stringify(bodyobj),
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return { status: "error", message: e.message };
  }
}

const randomIcons = [
  "baby-face-outline",
  "baby-face",
  "emoticon-angry-outline",
  "emoticon-angry",
  "emoticon-confused-outline",
  "emoticon-confused",
  "emoticon-cool-outline",
  "emoticon-cool",
  "emoticon-cry-outline",
  "emoticon-cry",
  "emoticon-dead-outline",
  "emoticon-dead",
  "emoticon-devil-outline",
  "emoticon-devil",
  "emoticon-excited-outline",
  "emoticon-excited",
  "emoticon-frown-outline",
  "emoticon-frown",
  "emoticon-happy-outline",
  "emoticon-happy",
  "emoticon-kiss-outline",
  "emoticon-kiss",
  "emoticon-lol-outline",
  "emoticon-lol",
  "emoticon-neutral-outline",
  "emoticon-neutral",
  "emoticon-outline",
  "emoticon-poop-outline",
  "emoticon-poop",
  "emoticon-sad-outline",
  "emoticon-sad",
  "emoticon-sick-outline",
  "emoticon-sick",
  "emoticon-tongue-outline",
  "emoticon-tongue",
  "emoticon-wink-outline",
  "emoticon-wink",
  "emoticon",
  "face-agent",
  "face-man-outline",
  "face-man-profile",
  "face-man-shimmer-outline",
  "face-man-shimmer",
  "face-man",
  "face-woman-outline",
  "face-woman-profile",
  "face-woman-shimmer-outline",
  "face-woman-shimmer",
  "face-woman",
  "halloween",
  "star-face",
];

const randomNames = [
  "白谷風吾朗",
  "遖優空",
  "阪野英聡",
  "千葉嶺",
  "宇検貴都",
  "山崎李環",
  "藏田颯",
  "指方來河",
  "當麻怜寿",
  "斧出健太郎",
  "内屋幸雄",
  "華岡昭",
  "開口雄亮",
  "小鴨剛",
  "下戸湊",
  "下荒磯優羽",
  "井住日空羅",
  "詫間琳空",
  "川橋稔",
  "下曽小川優維",
  "塚本陽向",
  "源氏田秀生",
  "西阪森夫",
  "鬣喬男",
  "内藤叫",
];

const randomTopics = [
  "明治普賢",
  "江分利満氏の刺青",
  "春の火花",
  "背負い城外",
  "白い我にあり",
  "鷺と日蝕",
  "塵の杳子",
  "螢の日本婦道記",
  "佃島ローヤル",
  "おどる夜明け",
  "限りなくれくいえむ",
  "徳山道助のフォーティーン",
  "美談の犬小屋",
  "あかね満ち欠け",
  "深いシネマ",
];
