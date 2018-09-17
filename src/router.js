import Vue from 'vue';
import Router from 'vue-router';

import Login from './views/Main/Main.vue';

Vue.use(Router);

const router = new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			component: Login
		}
	]
});

export default router;
