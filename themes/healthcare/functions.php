<?php
// Enqueue CSS files
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

// Enqueue JS files
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
        wp_localize_script('healthcare-ui-js', 'ajax_params', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('fetch_posts_nonce')
        ));
    }
}


// Register Custom Post Type: Application
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


// AJAX handler for logged-in users
add_action('wp_ajax_fetch_category_posts', 'fetch_category_posts_callback');
add_action('wp_ajax_nopriv_fetch_category_posts', 'fetch_category_posts_callback');

function fetch_category_posts_callback() {
    // Security
    check_ajax_referer('fetch_posts_nonce', 'nonce');

    // Read params
    $category_id = isset($_POST['category_id']) ? sanitize_text_field($_POST['category_id']) : 'all';
    $status      = isset($_POST['status']) ? sanitize_text_field($_POST['status']) : 'all';
    $type        = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'all';

    // Base query
    $args = array(
        'post_type'      => 'application',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
    );

    /**
     * CATEGORY / TYPE FILTER
     * Tabs + type dropdown both end up here
     */
    if ($category_id !== 'all' && !empty($category_id)) {
        $args['cat'] = (int) $category_id;
    } elseif ($type !== 'all' && !empty($type)) {
        $args['cat'] = (int) $type;
    }

    /**
     * STATUS FILTER (ACF field)
     */
    if ($status !== 'all' && !empty($status)) {
        $args['meta_query'] = array(
            array(
                'key'     => 'status',
                'value'   => $status,
                'compare' => 'LIKE', // allows "Awaiting Acknowledgment"
            )
        );
    }

    $applications = new WP_Query($args);

    $html = '';

    if ($applications->have_posts()) {
        while ($applications->have_posts()) {
            $applications->the_post();

            $contact_name = get_field('contact_name');
            $status_value = get_field('status');
            $email        = get_field('email');
            $expiry_date  = get_field('expiry_date');
            $title        = get_the_title();

            $categories   = get_the_category();
            $category_name = $categories[0]->name ?? 'Uncategorized';
            $cat_id        = $categories[0]->term_id ?? '';

            $date = get_the_date('m/d/Y');

            // Badge class
            $badge_class = 'success';
            $status_lower = strtolower($status_value);

            if (strpos($status_lower, 'denied') !== false) {
                $badge_class = 'danger';
            } elseif (strpos($status_lower, 'follow') !== false) {
                $badge_class = 'warning';
            } elseif (
                strpos($status_lower, 'awaiting') !== false ||
                strpos($status_lower, 'acknowledged') !== false
            ) {
                $badge_class = 'info';
            }

            $html .= '<tr data-type="' . esc_attr($category_name) . '" data-category-id="' . esc_attr($cat_id) . '">';
            $html .= '<td><a href="' . esc_url(get_permalink()) . '">' . esc_html($title) . '</a></td>';
            $html .= '<td>' . esc_html($category_name) . '</td>';
            $html .= '<td>' . esc_html($contact_name) . '</td>';
            $html .= '<td>' . esc_html($email) . '</td>';
            $html .= '<td>' . esc_html($date) . '</td>';
            $html .= '<td><span class="badge ' . esc_attr($badge_class) . '">' . esc_html($status_value) . '</span></td>';
            $html .= '<td>' . esc_html($expiry_date) . '</td>';
            $html .= '</tr>';
        }
        wp_reset_postdata();
    } else {
        $html = '<tr><td colspan="7" style="text-align:center;padding:20px;">No applications found.</td></tr>';
    }

    wp_send_json_success(array(
        'html' => $html
    ));
}

