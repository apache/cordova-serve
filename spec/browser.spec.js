/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const rewire = require('rewire');

function expectPromise (obj) {
    // 3 slightly different ways of verifying a promise
    expect(typeof obj.then).toBe('function');
    expect(obj instanceof Promise).toBe(true);
    expect(obj).toBe(Promise.resolve(obj));
}

describe('browser', () => {
    let browser;
    beforeEach(() => {
        browser = rewire('../src/browser');
        browser.__set__('open', jasmine.createSpy('mockOpen'));
    });

    it('exists and has expected properties', () => {
        expect(browser).toBeDefined();
        expect(typeof browser).toBe('function');
    });

    it('should return a promise', () => {
        const result = browser();
        expect(result).toBeDefined();
        expectPromise(result);

        return result;
    });

    it('should call open() when target is `default`', () => {
        const mockUrl = 'this is the freakin url';

        const result = browser({ target: 'default', url: mockUrl });
        expect(result).toBeDefined();
        expectPromise(result);

        return result.then(() => {
            expect(browser.__get__('open')).toHaveBeenCalledWith(mockUrl);
        });
    });

    describe('regItemPattern', () => {
        let regItemPattern;
        beforeEach(() => {
            regItemPattern = browser.__get__('regItemPattern');
        });

        const regPath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.EXE';
        const appPath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
        function expectPatternToExtractPathFrom (input) {
            expect(regItemPattern.exec(input)[2]).toBe(appPath);
        }

        it('should recognize browser from registry with key "Default" on English Windows 10', () => {
            expectPatternToExtractPathFrom(`${regPath} (Default)    REG_SZ    ${appPath}`);
        });

        it('should recognize browser from registry with key "Standard" on non-English Windows 10', () => {
            expectPatternToExtractPathFrom(`${regPath} (Standard)    REG_SZ    ${appPath}`);
        });

        it('should recognize browser with non-Latin registry key on Russian Windows 10', () => {
            expectPatternToExtractPathFrom(`${regPath} (�� 㬮�砭��)    REG_SZ    ${appPath}`);
        });
    });
});
