import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './common/Topbar';
import Bottombar from './common/Bottombar';
import { useLoginNoticeVisible } from './common/LoginNotice';

const RootLayout = ({ hideBottomBar }) => {
  const isLoginNoticeVisible = useLoginNoticeVisible();

  return (
    <div className="d-flex flex-column min-vh-100 ">
      <Topbar />

      <section className={`flex flex-1 h-full${isLoginNoticeVisible ? ' login-notice-offset' : ''}`}>
        <Outlet />
      </section>

      {!hideBottomBar && <Bottombar />}
    </div>
  )
}

export default RootLayout;
