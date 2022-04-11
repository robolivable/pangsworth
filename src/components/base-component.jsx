/*
    Pangsworth Info Butler. At your service anywhere in Madrigal.
    Copyright (C) 2021  https://github.com/robolivable

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import React from 'react'

const i18n = require('../i18n')

// define global context

export default class BaseComponent extends React.Component {
  get displayName () {
    const ctx = { language: 'en' }
    return i18n.localize(ctx, this.i18nKey, 'displayName')
  }
}
