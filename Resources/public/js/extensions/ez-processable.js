/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-processable', function (Y) {
    "use strict";
    /**
     * The processable extension
     *
     * @module ez-processable
     */
    Y.namespace('eZ');

    /**
     * View extension providing the concept of processor. The processors are
     * supposed to be run after the view has been rendered.
     *
     * @namespace eZ
     * @class Processable
     * @extensionfor Y.View
     */
    Y.eZ.Processable = Y.Base.create('processableExtension', Y.View, [], {
        /**
         * Adds a processor to the list with the given priority. A processor is
         * an object that should have a `process` method. When run, the
         * processor will receive the view being processed.
         *
         * @method addProcessor
         * @param {Object} processor
         * @param {Number} priority
         */
        addProcessor: function (processor, priority) {
            var processors = this.get('processors');

            if ( typeof processor.process !== 'function' ) {
                throw new Error("Processor must have a process method");
            }
            processors.push({
                processor: processor,
                priority: priority,
            });
            processors.sort(function (a, b) {
                return (b.priority - a.priority);
            });
        },

        /**
         * Removes one or several processors matching the given `matchingFn`
         * function.
         *
         * @method removeProcessor
         * @param {Function} matchingFn it receives the processor and if it
         * returns a truthy value, the corresponding processor is excluded from
         * the list.
         */
        removeProcessor: function (matchingFn) {
            var processors = this.get('processors');

            this._set('processors', processors.filter(function () {
                return !matchingFn.apply(this, arguments);
            }, this));
        },

        /**
         * Overrides the `render` method to make sure the processors are called
         * right after the rendering of the view.
         *
         * @method render
         * @return {View}
         */
        render: function () {
            this.constructor.superclass.render.apply(this, arguments);
            this._process();
            return this;
        },

        /**
         * Loops through the processors to run them on the view.
         *
         * @method _process
         * @protected
         */
        _process: function () {
            this.get('processors').forEach(function (info) {
                info.processor.process(this);
            }, this);
        },
    }, {
        ATTRS: {
            /**
             * Holds the processors. Each entry is an object containing 2
             * properties:
             * - `processor` the processor
             * - `priority` its priority
             *
             * @attribute priority
             * @type {Array}
             * @readOnly
             */
            processors: {
                readOnly: true,
                value: [],
            },
        },
    });
});
