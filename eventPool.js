'use strict';

const Events = require('events');
const eventEmitter = new Events();

// Description: Event pool for socket.io events
const eventPool = {
  DISCONNECT: 'disconnect',
  START_GAME: 'start_game',
  END_GAME: 'end_game',
  NEW_GAME: 'new_game',

  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',
  PLAYER_SEARCH: 'player_search',

  USER_CHECK_ACCOUNT_RESPONSE: 'user_check_account_response',
  USER_CHECK_ACCOUNT: 'user_check_account',
  USER_CREATE_ACCOUNT: 'user_create_account',
  USER_CREATE_ACCOUNT_RESPONSE: 'user_create_account_response',
  USER_AUTHENTICATE_SUCCESS: 'user_authenticate_success',
  USER_AUTHENTICATE_ERROR: 'user_authenticate_error',
  USER_JOIN_SUCCESS: 'user_join_success',
  USER_LEAVE_SUCCESS: 'user_leave_success',
  USER_CREATE_SUCCESS: 'user_create_success',
  USER_CREATE_ERROR: 'user_create_error',
  USER_PROFILE_SUCCESS: 'user_profile_success',
  USER_PROFILE_ERROR: 'user_profile_error',
  USER_PROFILE_UPDATE_SUCCESS: 'user_profile_update_success',
  USER_PROFILE_UPDATE_ERROR: 'user_profile_update_error',
  USER_AUTHENTICATE: 'user_authenticate',
  USER_LOGIN: 'user_login',
  USER_JOIN: 'user_join',
  USER_LEAVE: 'user_leave',
  SEND_MESSAGE: 'send_message',

  CHARACTER_JOIN: 'character_join',
  CHARACTER_LEAVE: 'character_leave',
  CHARACTER_LEVELED_UP: 'character_leveled_up',
  CHARACTER_DEFEATED: 'character_defeated',
  CHARACTER_VICTORY: 'character_victory',
  CHARACTER_INVENTORY: 'character_inventory',

  CHARACTER_ACTION_ATTACK: 'character_action_attack',
  CHARACTER_ACTION_DEFEND: 'character_action_defend',
  CHARACTER_ACTION_HEAL: 'character_action_heal',
  CHARACTER_ACTION_FLEE: 'character_action_flee',
  CHARACTER_ACTION_CUSTOM: 'character_action_custom',

  ENEMY_SPAWN: 'enemy_spawn',
  ENEMY_KILLED: 'enemy_killed',
  LOOT_DROP: 'loot_drop',

  USER_JOIN_ERROR: 'user_join_error',
  USER_LEAVE_ERROR: 'user_leave_error',
  SEND_MESSAGE_ERROR: 'send_message_error',
};

module.exports = {
  eventPool,
  eventEmitter,
};
