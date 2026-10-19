// SPDX-License-Identifier: AGPL-3.0-or-later

import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {frontmatterBlock} from './DocsSource.ts';

describe('frontmatterBlock', () => {
	it('reads LF frontmatter', () => {
		assert.equal(frontmatterBlock('---\ntitle: Example\n---\nbody'), 'title: Example');
	});

	it('reads CRLF frontmatter from Windows checkouts', () => {
		assert.equal(frontmatterBlock('---\r\ntitle: Example\r\n---\r\nbody'), 'title: Example');
	});

	it('rejects a missing or unterminated block', () => {
		assert.equal(frontmatterBlock('# Example\nbody'), null);
		assert.equal(frontmatterBlock('---\ntitle: Example\nbody'), null);
	});
});
