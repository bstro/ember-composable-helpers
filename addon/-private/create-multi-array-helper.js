import Ember from 'ember';
import {
  A as emberArray,
  isEmberArray as isArray
} from 'ember-array/utils';
import Helper from 'ember-helper';
import { guidFor } from 'ember-metal/utils';
import observer from 'ember-metal/observer';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { isEmpty } from 'ember-utils';

const { defineProperty } = Ember;
const idForArray = (array) => `__array-${guidFor(array)}`;

export default function(multiArrayComputed) {
  return Helper.extend({
    compute([...arrays]) {
      set(this, 'arrays', arrays.map((obj) => {
        if (isArray(obj)) {
          return emberArray(obj);
        }

        return obj;
      }));

      return get(this, 'content');
    },

    valuesDidChange: observer('arrays.[]', function() {
      this._recomputeArrayKeys();

      let arrays = get(this, 'arrays');
      let arrayKeys = get(this, 'arrayKeys');

      if (isEmpty(arrays)) {
        defineProperty(this, 'content', []);
        return;
      }

      defineProperty(this, 'content', multiArrayComputed(...arrayKeys));
    }),

    contentDidChange: observer('content.[]', function() {
      this.recompute();
    }),

    _recomputeArrayKeys() {
      let arrays = get(this, 'arrays');

      let oldArrayKeys = get(this, 'arrayKeys') || [];
      let newArrayKeys = arrays.map(idForArray);

      let keysToRemove = oldArrayKeys.filter((key) => {
        return newArrayKeys.indexOf(key) === -1;
      });

      keysToRemove.forEach((key) => set(this, key, null));
      arrays.forEach((array) => set(this, idForArray(array), array));

      set(this, 'arrayKeys', newArrayKeys);
    }
  });
}
