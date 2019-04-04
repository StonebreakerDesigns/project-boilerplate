/** Admin dashboard with basic system monitoring. */
import { Component, h } from 'preact';

import { userOfType } from '../auth';

/** The page. */
class AdminDashboardPage extends Component {
    render() { return (
        <h1>Hello admin!</h1> 
    ); }
}

//  Export.
export default {
    metadata: {title: 'Admin dashboard', description: 'Administrator dashboard.'},
    authCheck: userOfType('admin'),
    component: AdminDashboardPage
};