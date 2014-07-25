/*global $, Mustache*/
(function( window, document, $, Mustache, undefined ) {
  'use strict';

  window.StyleguideGenerator = (function() {
    function StyleguideGenerator( options ) {
      this.target = $( options.el );
      this.components = options.components;
      this.data = options.data;
      this.components.forEach(function( component ) {
        component.partial = function() {
          return '{{> ' + component.name + '}}';
        };
      });
      this.partials = {};
      this.init();
    }

    StyleguideGenerator.fn = StyleguideGenerator.prototype;

    StyleguideGenerator.fn.loadTemplate = function( name ) {
      return $.ajax({
        url: 'templates/' + name + '.mustache'
      }).done(function( tmpl ) {
        this.partials[ name ] = tmpl;
      }.bind( this ));
    };

    StyleguideGenerator.fn.loadTemplates = function() {
      var names = this.components.map(function( component ) {
        return component.name;
      });
      return names.map( this.loadTemplate.bind( this ) );
    };

    StyleguideGenerator.fn.render = function() {
      $.when(
        this.loadTemplate.call( this, 'components' )
      ).then( function( template ) {
        template = Mustache.render( template, this.components );
        var rendered = Mustache.render( template, this.data, this.partials );
        this.target.html( rendered );
      }.bind( this ));
    };

    StyleguideGenerator.fn.handleLoadError = function( e ) {
      console.error( e.message );
    };

    StyleguideGenerator.fn.init = function() {
      $.when.apply( $, this.loadTemplates.call( this ) )
        .then( this.render.bind( this ) )
        .fail( this.handleLoadError );
    };

    return StyleguideGenerator;
  })();
})( window, document, $, Mustache );