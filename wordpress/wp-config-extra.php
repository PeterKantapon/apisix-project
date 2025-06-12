<?php
// wordpress/wp-config-extra.php
// Additional WordPress configuration for REST API

// Enable REST API for all users
add_filter('rest_authentication_errors', function($result) {
    if (!empty($result)) {
        return $result;
    }
    if (!is_user_logged_in()) {
        return true;
    }
    return $result;
});

// Enable CORS for REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
}, 15);

// Create sample posts on activation
function create_sample_posts() {
    // Check if sample posts already exist
    $existing_posts = get_posts(array(
        'post_type' => 'post',
        'meta_key' => '_sample_post',
        'meta_value' => 'true',
        'posts_per_page' => 1
    ));
    
    if (!empty($existing_posts)) {
        return; // Sample posts already exist
    }
    
    // Create sample posts
    $sample_posts = array(
        array(
            'post_title' => 'Welcome to APISIX Demo',
            'post_content' => 'This is a sample post created for demonstrating the APISIX integration with WordPress REST API. You can access this content through the API gateway.',
            'post_status' => 'publish',
            'post_author' => 1,
            'meta_input' => array('_sample_post' => 'true')
        ),
        array(
            'post_title' => 'API Gateway Integration',
            'post_content' => 'Apache APISIX is a dynamic, real-time, high-performance API gateway that provides rich traffic management features like load balancing, dynamic upstream, canary release, circuit breaking, authentication, observability, and more.',
            'post_status' => 'publish',
            'post_author' => 1,
            'meta_input' => array('_sample_post' => 'true')
        ),
        array(
            'post_title' => 'GoFiber Backend Demo',
            'post_content' => 'This demo also includes a GoFiber backend that handles custom API logic and interacts with a MariaDB database. All requests are routed through APISIX for centralized API management.',
            'post_status' => 'publish',
            'post_author' => 1,
            'meta_input' => array('_sample_post' => 'true')
        ),
        array(
            'post_title' => 'React Dashboard',
            'post_content' => 'The React dashboard provides a user-friendly interface to manage APISIX routes and upstreams. You can create, view, and delete routes directly from the dashboard.',
            'post_status' => 'publish',
            'post_author' => 1,
            'meta_input' => array('_sample_post' => 'true')
        )
    );
    
    foreach ($sample_posts as $post_data) {
        wp_insert_post($post_data);
    }
}

// Hook to create sample posts after WordPress is fully loaded
add_action('init', 'create_sample_posts');

// Custom REST API endpoint for demo purposes
add_action('rest_api_init', function() {
    register_rest_route('demo/v1', '/status', array(
        'methods' => 'GET',
        'callback' => function() {
            return new WP_REST_Response(array(
                'status' => 'active',
                'message' => 'WordPress API is working through APISIX',
                'timestamp' => current_time('mysql'),
                'posts_count' => wp_count_posts()->publish
            ), 200);
        },
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('demo/v1', '/health', array(
        'methods' => 'GET',
        'callback' => function() {
            return new WP_REST_Response(array(
                'health' => 'ok',
                'database' => 'connected',
                'api' => 'functional'
            ), 200);
        },
        'permission_callback' => '__return_true'
    ));
});

// Disable XML-RPC for security
add_filter('xmlrpc_enabled', '__return_false');

// Remove WordPress version from head
remove_action('wp_head', 'wp_generator');