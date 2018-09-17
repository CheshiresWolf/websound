import Vue from 'vue';
import Vuex from 'vuex';

// ======= <store_new> =======

import Playlist from "@/store/modules/Playlist";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
	modules: {
		Playlist
	},
	strict: debug,
});
