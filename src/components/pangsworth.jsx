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

    You can contact the author by email at robolivable@gmail.com.
*/
import React from 'react'
import { styled } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'

import InboxIcon from '@material-ui/icons/MoveToInbox'
import MailIcon from '@material-ui/icons/Mail'

import Navigation from './'
import { ReactiveDrawer } from './common'

const RootDiv = styled('div')(() => ({
  display: 'flex'
}))

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3)
}))

export default class Pangsworth extends React.Component {
  constructor (...args) {
    super(...args)
    this.state = {
    }
  }

  render () {
    return (
      <RootDiv>
        <CssBaseline />
        <ReactiveDrawer items={[
          ['Inbox', MailIcon],
          ['Starred', InboxIcon],
          ['Send email', MailIcon],
          ['Drafts', InboxIcon]
        ]}
        />
        <Main>
          <Typography paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Rhoncus
            dolor purus non enim praesent elementum facilisis leo vel. Risus at
            ultrices mi tempus imperdiet. Semper risus in hendrerit gravida rutrum
            quisque non tellus. Convallis convallis tellus id interdum velit
            laoreet id donec ultrices. Odio morbi quis commodo odio aenean sed
            adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies
            integer quis. Cursus euismod quis viverra nibh cras. Metus vulputate
            eu scelerisque felis imperdiet proin fermentum leo. Mauris commodo
            quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat
            vivamus at augue. At augue eget arcu dictum varius duis at consectetur
            lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa sapien
            faucibus et molestie ac.
          </Typography>
        </Main>
      </RootDiv>
    )
  }
}
