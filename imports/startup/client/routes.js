import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import Vaults from '/imports/api/vaults';

// Import to load these templates
import '/imports/ui/layouts/main';
import '/imports/ui/layouts/header';
import '/imports/ui/layouts/footer';
import '/imports/ui/pages/portal';
import '/imports/ui/pages/visit';
import '/imports/ui/pages/fund';
import '/imports/ui/pages/manage';
import '/imports/ui/pages/wallet';

// Default route
FlowRouter.route('/', {
  name: 'portal',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layout_header',
      header: 'uxIndexPortal',
      main: 'portal',
      footer: 'layout_footer',
    });
  },
});

FlowRouter.route('/visit', {
  name: 'visit',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layout_header',
      header: 'uxIndexPortal',
      main: 'visit',
      footer: 'layout_footer',
      visit: true,
    });
  },
});

FlowRouter.route('/visit/:address', {
  name: 'visit',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layout_header',
      header: 'uxIndexPortal',
      main: 'fund',
      footer: 'layout_footer',
      visit: true,
    });
  },
});

FlowRouter.route('/fund/:address', {
  name: 'fund',
  action(params) {
    if (Vaults.findOne({ address: params.address })) {
      BlazeLayout.render('layout_main', {
        nav: 'layout_header',
        header: 'ux_portfolioOverview',
        main: 'fund',
        footer: 'layout_footer',
      });
    } else {
      BlazeLayout.render('layout_main', {
        nav: 'layout_header',
        header: 'ux_portfolioOverview',
        main: 'uxFundNotFound',
        footer: 'layout_footer',
      });
    }
  },
});

FlowRouter.route('/manage/:address', {
  name: 'manage',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layout_header',
      header: 'ux_manageOverview',
      main: 'manage',
      footer: 'layout_footer',
    });
  },
});

// Route for account
FlowRouter.route('/account/:address', {
  name: 'account',
  action() {
    BlazeLayout.render('layoutMain', {
      nav: 'layout_header',
      header: 'ux_walletOverview',
      main: 'wallet',
      footer: 'layout_footer',
    });
  },
});
