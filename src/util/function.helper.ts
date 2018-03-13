/*
 * Copyright 2017 Orange
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class FunctionHelper {

    /** Capitalize first Letter
     * @param {string} str
     * @returns {string} - Modified String
     * @public
     */
    public static capitalizeFirstLetter(str): string {
        return str.charAt(0).toUpperCase() + str.slice(1);

    }

    /** Return list of parameters for function pass in params
     * @param {function} func
     * @returns {string} - Modified String
     * @private
     */
    public static getParamNames(func): string[] {
        const fnStr = func.toString().replace(FunctionHelper.STRIP_COMMENTS, "");
        let result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(FunctionHelper.ARGUMENT_NAMES);
        if (result === null) {
            result = [];
        }
        return result;
    }

    private static STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    private static ARGUMENT_NAMES = /([^\s,]+)/g;
}
