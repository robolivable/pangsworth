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
import ReactDOM from 'react-dom'
import Pangsworth from './components/pangsworth'
import Context from './clients/context'

const HTML_MIN_HEIGHT = '600px'
const HTML_MIN_WIDTH = '740px'

const PangContext = new Context()
PangContext.fetchSettings().then(() => {
  document.documentElement.style.minHeight = HTML_MIN_HEIGHT
  document.documentElement.style.minWidth = HTML_MIN_WIDTH
  const root = document.querySelector('#root')
  // eslint-disable-next-line
  return ReactDOM.render(<Pangsworth PangContext={PangContext} />, root)
})
