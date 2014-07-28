/*global $, Mustache*/
(function( window, document, $, Mustache, undefined ) {
  'use strict';

  window.StyleguideGenerator = function( options ) {

    function getLocationHash() {
      return window.location.hash.substring( 1 );
    }

    function handleError( e ) {
      console.error( e.message );
    }

    var target = $( options.el ),

      components = options.components,

      data = options.data,

      componentToIsolate = getLocationHash(),

      partials = {},

      dom = {},

      IS_HIDDEN_CLASS = 'sg-is-hidden',

      COMPONENT_CLASS = 'sg-component',

      getComponentPartialString = function( component ) {
        return '{{> ' + component.name + '}}';
      },

      setComponentPartialProp = function( component ) {
        component.partial = getComponentPartialString( component );
      },

      isolateComponent = function() {
        componentToIsolate = getLocationHash();
        if ( componentToIsolate ) {
          dom.components.not( '[data-is-component="' + componentToIsolate + '"]')
            .addClass( IS_HIDDEN_CLASS );
        } else {
          dom.components.removeClass( IS_HIDDEN_CLASS );
        }
      },

      loadTemplate = function( name ) {
        return $.ajax({
          url: 'templates/' + name + '.mustache'
        }).done(function( tmpl ) {
          partials[ name ] = tmpl;
        });
      },

      loadTemplates = function() {
        var names = components.map(function( component ) {
          return component.name;
        });
        return names.map( loadTemplate );
      },

      render = function() {
        $.when( loadTemplate( 'components' ) )
          .then( function( template ) {
            template = Mustache.render( template, components );
            var rendered = Mustache.render( template, data, partials );
            target.html( rendered );
            cacheDOM();
            if ( componentToIsolate ) {
              isolateComponent();
            }
          });
      },

      cacheDOM = function() {
        dom.components = $( '.' + COMPONENT_CLASS );
      },

      bindEvents = function() {
        $( window ).on( 'hashchange', isolateComponent );
      },

      init = function() {
        components.forEach( setComponentPartialProp );
        bindEvents();
        $.when.apply( $, loadTemplates() )
          .then( render )
          .fail( handleError );
      };

    init();

  };
})( window, document, $, Mustache );