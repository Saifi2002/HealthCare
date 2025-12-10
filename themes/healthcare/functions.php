<?php

add_action('wp_enqueue_scripts', 'healthcare_enqueue_styles');
if (! function_exists('healthcare_enqueue_styles')) {
    function healthcare_enqueue_styles()
    {

        // Local stylesheet
        wp_enqueue_style(
            'healthcare-style',
            get_template_directory_uri() . '/assets/css/style.css',
            array(),
            filemtime(get_template_directory() . '/assets/css/style.css')
        );

        // Lucide Icons
        wp_enqueue_style(
            'lucide-icons',
            'https://cdn.jsdelivr.net/npm/lucide/dist/lucide.css',
            array(),
            null
        );

        // Font Awesome
        wp_enqueue_style(
            'font-awesome',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            array(),
            '6.4.0'
        );

        // Iconoir
        wp_enqueue_style(
            'iconoir-icons',
            'https://cdn.jsdelivr.net/gh/iconoir-icons/iconoir@main/css/iconoir.css',
            array(),
            null
        );

        // Neue Haas Grotesk Font
        wp_enqueue_style(
            'neue-haas-font',
            'https://fonts.cdnfonts.com/css/neue-haas-grotesk-display-pro?styles=23457,23459,23461',
            array(),
            null
        );
    }
}

add_action('wp_enqueue_scripts', 'healthcare_enqueue_scripts');
if (! function_exists('healthcare_enqueue_scripts')) {
    function healthcare_enqueue_scripts()
    {

        // UI JS file
        wp_enqueue_script(
            'healthcare-ui-js',
            get_template_directory_uri() . '/assets/js/script.js',
            array(), // dependencies (add ['jquery'] if needed)
            filemtime(get_template_directory() . '/assets/js/script.js'),
            true // load in footer
        );
    }
}



add_action('init', 'application_post_type');
if (! function_exists('application_post_type')) {
    function application_post_type()
    {

        $labels = array(
            'name'                  => _x('Applications', 'health-care'),
            'singular_name'         => _x('Application', 'health-care'),
            'menu_name'             => __('Applications', 'health-care'),
            'name_admin_bar'        => __('Application', 'health-care'),
            'archives'              => __('Application Archives', 'health-care'),
            'attributes'            => __('Application Attributes', 'health-care'),
            'parent_item_colon'     => __('Parent Application:', 'health-care'),
            'all_items'             => __('All Applications', 'health-care'),
            'add_new_item'          => __('Add New Application', 'health-care'),
            'add_new'               => __('Add New', 'health-care'),
            'new_item'              => __('New Application', 'health-care'),
            'edit_item'             => __('Edit Application', 'health-care'),
            'update_item'           => __('Update Application', 'health-care'),
            'view_item'             => __('View Application', 'health-care'),
            'view_items'            => __('View Applications', 'health-care'),
            'search_items'          => __('Search Application', 'health-care'),
        );

        $args = array(
            'label'                 => __('Application', 'health-care'),
            'description'           => __('Post Type for Applications', 'health-care'),
            'labels'                => $labels,
            'supports'              => array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments'),
            'taxonomies'            => array('category', 'post_tag'),
            'hierarchical'          => false,
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'menu_position'         => 5,
            'menu_icon'             => 'dashicons-clipboard',
            'show_in_admin_bar'     => true,
            'show_in_nav_menus'     => true,
            'can_export'            => true,
            'has_archive'           => true,
            'exclude_from_search'   => false,
            'publicly_queryable'    => true,
            'capability_type'       => 'post',
        );
        register_post_type('application', $args);
    }
}
