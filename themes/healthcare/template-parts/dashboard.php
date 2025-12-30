<?php
/* Template Name: Dashboard Template */
get_header();
?>

<div class="container">
    <?php
    $user = wp_get_current_user();
    ?>
    <h1 class="title"><?php echo esc_html__('WELCOME', 'health-care'); ?> <?php echo strtoupper($user->user_login); ?></h1>

    <div class="grid">

        <main class="main-content">
            <div class="card main-card">

                <?php
                $args = array(
                    'post_type' => 'application',
                    'taxonomy' => 'category',
                );
                $cats = get_categories($args);
                ?>
                <div class="tabs">
                    <button class="tab active" data-category="all">
                        <i class="fa-solid fa-eye"></i> View All
                    </button>
                    <?php foreach ($cats as $cat) { ?>
                        <button class="tab" data-category="<?php echo $cat->term_id; ?>">
                            <?php echo $cat->name; ?>
                        </button>
                    <?php } ?>
                </div>

                <div class="providers-list">
                    <h2>Providers Lists</h2>
                </div>

                <div class="filters">
                    <div class="filter">
                        <i class="iconoir iconoir-filter-alt"></i>
                    </div>

                    <div class="select-wrapper custom-wrapper">
                        <select id="sortSelect">
                            <option value="newest">Most Recent</option>
                            <option value="oldest">Oldest</option>
                        </select>
                    </div>

                    <?php
                    $app_status = new WP_Query(array(
                        'post_type' => 'application',
                        'posts_per_page' => -1,
                    ));
                    if ($app_status->have_posts()) :
                        $status_terms = array();
                        while ($app_status->have_posts()) : $app_status->the_post();
                            $status = get_field('status');
                            if ($status && !in_array($status, $status_terms)) {
                                $status_terms[] = $status;
                            }
                        endwhile;
                        wp_reset_postdata();
                    ?>
                        <div class="select-wrapper">
                            <select id="statusSelect">
                                <option value="all">All Status</option>
                                <?php
                                foreach ($status_terms as $status) :
                                ?>
                                    <option value="<?php echo esc_attr($status); ?>"><?php echo esc_html(ucwords($status)); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    <?php endif; ?>

                    <div class="select-wrapper">
                        <select id="typeSelect">
                            <option value="all">View All</option>
                            <?php foreach ($cats as $cat) { ?>
                                <option value="<?php echo $cat->term_id; ?>"><?php echo $cat->name; ?></option>
                            <?php } ?>
                        </select>
                    </div>

                    <div class="date-range-filter-container custom-wrapper">
                        <button id="dateRangeToggle" class="filter-dropdown-toggle select-wrapper">
                            <span id="dateRangeDisplay">Date Range</span>
                        </button>

                        <div id="dateRangePopover" class="filter-popover hidden">
                            <div id="calendarContainer"></div>

                            <div class="popover-actions">
                                <button id="dateRangeClear" class="clear-button">Clear</button>
                                <button id="dateRangeApply" class="apply-button">Apply</button>
                            </div>
                        </div>
                    </div>
                    <button class="reset" onclick="resetFilters()">
                        <i class="fa-solid fa-rotate-left"></i> Reset Filter
                    </button>
                </div>

                <div class="table-container">
                    <table id="applicationTable">
                        <thead>
                            <tr>
                                <th><?php echo esc_html__("Agency", "health-care"); ?></th>
                                <th><?php echo esc_html__("Type", "health-care"); ?></th>
                                <th><?php echo esc_html__("Contact Name", "health-care"); ?></th>
                                <th><?php echo esc_html__("Email", "health-care"); ?></th>
                                <th><?php echo esc_html__("Date Submitted", "health-care"); ?></th>
                                <th><?php echo esc_html__("Status", "health-care"); ?></th>
                                <th><?php echo esc_html__("Date Trigger", "health-care"); ?></th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <?php
                            // Initial load - show all posts
                            $applications = new WP_Query(array(
                                'post_type' => 'application',
                                'posts_per_page' => -1,
                            ));

                            if ($applications->have_posts()) :
                                while ($applications->have_posts()) : $applications->the_post();
                                    $contact_name = get_field('contact_name');
                                    $status = get_field('status');
                                    $email = get_field('email');
                                    $expiry_date = get_field('expiry_date');
                                    $title = get_the_title();

                                    // Get category - FIXED: Get category name consistently
                                    $categories = get_the_category();
                                    $category_name = !empty($categories) ? $categories[0]->name : 'Uncategorized';
                                    $category_id = !empty($categories) ? $categories[0]->term_id : '';

                                    $date = get_the_date('m/d/Y');

                                    // Determine badge class based on status
                                    $badge_class = 'success';
                                    $status_lower = strtolower($status);
                                    if (strpos($status_lower, 'denied') !== false) {
                                        $badge_class = 'danger';
                                    } elseif (strpos($status_lower, 'follow') !== false) {
                                        $badge_class = 'warning';
                                    } elseif (strpos($status_lower, 'awaiting') !== false || strpos($status_lower, 'acknowledged') !== false) {
                                        $badge_class = 'info';
                                    }
                            ?>
                                    <tr data-type="<?php echo esc_attr($category_name); ?>" data-category-id="<?php echo esc_attr($category_id); ?>">
                                        <td><a href="<?php the_permalink(); ?>"><?php echo esc_html($title); ?></a></td>
                                        <td><?php echo esc_html($category_name); ?></td>
                                        <td><?php echo esc_html($contact_name); ?></td>
                                        <td><?php echo esc_html($email); ?></td>
                                        <td><?php echo esc_html($date); ?></td>
                                        <td><span class="badge <?php echo esc_attr($badge_class); ?>"><?php echo esc_html($status); ?></span></td>
                                        <td><?php echo esc_html($expiry_date); ?></td>
                                    </tr>
                                <?php
                                endwhile;
                                wp_reset_postdata();
                            else:
                                ?>
                                <tr>
                                    <td colspan="7" style="text-align: center; padding: 20px;">
                                        <?php echo esc_html__("No applications found.", "health-care"); ?>
                                    </td>
                                </tr>
                            <?php
                            endif;
                            ?>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Container -->
                <nav class="pagination-container" aria-label="Page navigation">
                    <ul class="pagination" id="pagination-links">
                        <!-- Pagination links will be generated by JS -->
                    </ul>
                </nav>

            </div>

        </main>

        <aside class="sidebar">
            <?php
            $count_post = wp_count_posts('application')->publish;
            function get_scf_status_count($post_type, $field_name, $field_value)
            {
                $args = array(
                    'post_type'      => $post_type,
                    'posts_per_page' => -1,
                    'post_status'    => 'publish',
                    'fields'         => 'ids',
                    'meta_query'     => array(
                        array(
                            'key'     => $field_name,
                            'value'   => $field_value,
                            'compare' => '=',
                        ),
                    ),
                );

                $query = new WP_Query($args);
                return $query->post_count;
            }

            $denied_count = get_scf_status_count('application', 'status', 'denied');
            $approved_count = get_scf_status_count('application', 'status', 'approved');
            $follow_up_count = get_scf_status_count('application', 'status', 'follow-up');
            $acknowledged_count = get_scf_status_count('application', 'status', 'acknowledged');
            ?>
            <div class="card status-card">
                <h2><?php echo esc_html__('Status of Applications', 'health-care'); ?></h2>
                <div class="applications">
                    <div class="status-item custom-status-list">
                        <div>
                            <p class="label"><?php echo esc_html__('Applications Submitted', 'health-care'); ?></p>
                            <p class="status-sub"><?php echo esc_html__('Since last 30 days', 'health-care'); ?></p>
                        </div>
                        <p class="number"><?php echo $count_post; ?></p>
                    </div>
                    <div class="status-list">
                        <div class="status-item success">
                            <div>
                                <p class="status-label"><?php echo esc_html__('Approved', 'health-care');  ?> </p>
                                <p class="status-sub"><?php echo esc_html__('Since last 30 days', 'health-care');  ?></p>
                            </div>
                            <p class="status-number"><?php echo $approved_count; ?></p>
                        </div>
                        <div class="status-item info">
                            <div>
                                <p class="status-label"><?php echo esc_html__('Awaiting Acknowledgment', 'health-care');  ?></p>
                                <p class="status-sub"><?php echo esc_html__('Since last 30 days', 'health-care');  ?></p>
                            </div>
                            <p class="status-number"><?php echo $acknowledged_count; ?></p>
                        </div>
                        <div class="status-item destructive">
                            <div>
                                <p class="status-label"><?php echo esc_html__('Denied', 'health-care');  ?></p>
                                <p class="status-sub"><?php echo esc_html__('Since last 30 days', 'health-care');  ?></p>
                            </div>
                            <p class="status-number"><?php echo $denied_count; ?></p>
                        </div>
                        <div class="status-item warning">
                            <div>
                                <p class="status-label"><?php echo esc_html__('Follow-Up Required', 'health-care');  ?></p>
                                <p class="status-sub"><?php echo esc_html__('Since last 30 days', 'health-care');  ?></p>
                            </div>
                            <p class="status-number"><?php echo $follow_up_count; ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card activity-card">
                <h2>BHSD Activity Log</h2>
                <div class="activity-list">
                    <div class="activity">
                        <div class="dot"></div>
                        <div class="activity-log">
                            <p class="date">Oct 8, 2024 - 6:04 PM</p>
                            <p class="text">Document viewed by Phil Huston - kim.rogge.rogers@gmail.com (viewed)</p>
                            <p class="status"> <i>Status: <span> Viewed successfully.</span></i></p>
                        </div>
                    </div>
                    <div class="activity">
                        <div class="dot"></div>
                        <div class="activity-log">
                            <p class="date">Oct 8, 2024 - 5:48 PM</p>
                            <p class="text">Document viewed by Phil Huston - kim.rogge.rogers@gmail.com (viewed)</p>
                            <p class="status"> <i>Status: <span> Viewed successfully.</span></i></p>
                        </div>
                    </div>
                    <div class="activity">
                        <div class="dot"></div>
                        <div class="activity-log">
                            <p class="date">Oct 8, 2024 - 5:48 PM</p>
                            <p class="text">Document viewed by Phil Huston - kim.rogge.rogers@gmail.com (viewed)</p>
                            <p class="status"> <i>Status: <span> Viewed successfully.</span></i></p>
                        </div>
                    </div>
                    <div class="activity">
                        <div class="dot"></div>
                        <div class="activity-log">
                            <p class="date">Oct 8, 2024 - 5:48 PM</p>
                            <p class="text">Document viewed by Phil Huston - kim.rogge.rogers@gmail.com (viewed)</p>
                            <p class="status"> <i>Status: <span> Viewed successfully.</span></i></p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</div>

<?php get_footer(); ?>