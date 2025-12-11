<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <?php wp_head(); ?>
</head>
<body>
    
    <div class="container">
        <?php   
        $user = wp_get_current_user();
        ?>
        <h1 class="title">WELCOME <?php echo strtoupper($user->user_login); ?></h1>

        <div class="grid">
            
            <aside class="sidebar">
                <div class="card status-card">
                    <h2>Status of Applications</h2>
                    <div class="applications">
                        <div class="status-item custom-status-list">
                            <div>
                                <p class="label">Applications Submitted</p>
                                <p class="status-sub">Since last 30 days</p>
                            </div>
                            <p class="number">42</p>
                        </div>
                        <div class="status-list">
                            <div class="status-item success">
                                <div>
                                    <p class="status-label">Approved</p>
                                    <p class="status-sub">Since last 30 days</p>
                                </div>
                                <p class="status-number">25</p>
                            </div>
                            <div class="status-item info">
                                <div>
                                    <p class="status-label">Awaiting Acknowledgment</p>
                                    <p class="status-sub">Since last 30 days</p>
                                </div>
                                <p class="status-number">08</p>
                            </div>
                            <div class="status-item destructive">
                                <div>
                                    <p class="status-label">Denied</p>
                                    <p class="status-sub">Since last 30 days</p>
                                </div>
                                <p class="status-number">06</p>
                            </div>
                            <div class="status-item warning">
                                <div>
                                    <p class="status-label">Follow-Up Required</p>
                                    <p class="status-sub">Since last 30 days</p>
                                </div>
                                <p class="status-number">03</p>
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

            <main class="main-content">
                <div class="card main-card">
                    
                    <div class="tabs">
                        <button class="tab active" onclick="filterTabs(event, 'all')"><i class="fa-solid fa-eye"></i> View All</button>
                        <button class="tab" onclick="filterTabs(event, 'AARTC')">AARTC</button>
                        <button class="tab" onclick="filterTabs(event, 'ACT')">ACT</button>
                        <button class="tab" onclick="filterTabs(event, 'CCBHC')">CCBHC</button>
                        <button class="tab" onclick="filterTabs(event, 'CCSS')">CCSS</button>
                        <button class="tab" onclick="filterTabs(event, 'IOP')">IOP</button>
                        <button class="tab" onclick="filterTabs(event, 'MCT')">MCT</button>
                        <button class="tab" onclick="filterTabs(event, 'OPRE')">OPRE</button>
                        <button class="tab" onclick="filterTabs(event, 'PSR')">PSR</button>
                    </div>
                    
                    <div class="providers-list">
                        <h2>Providers Lists</h2>
                    </div>

                    <div class="filters">
                        <div class="filter">
                            <i class="iconoir iconoir-filter-alt"></i>
                        </div>
                    
                        <div class="select-wrapper custom-wrapper">
                            <select id="sortSelect" onchange="applyFilters()">
                                <option value="newest">Most Recent</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>
                    
                        <div class="select-wrapper">
                            <select id="statusSelect" onchange="applyFilters()">
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="denied">Denied</option>
                                <option value="follow-up">Follow-up</option>
                            </select>
                        </div>
                    
                        <div class="select-wrapper">
                            <select id="typeSelect" onchange="applyFilters()">
                                <option value="all">All Types</option>
                                <option value="CCSS">CCSS</option>
                                <option value="AARTC">AARTC</option>
                                <option value="ACT">ACT</option>
                                <option value="CCBHC">CCBHC</option>
                                <option value="IOP">IOP</option>
                                <option value="MCT">MCT</option>
                                <option value="OPRE">OPRE</option>
                                <option value="PSR">PSR</option>
                            </select>
                        </div>
                    
                        <div class="date-range-filter-container custom-wrapper">
                            <button id="dateRangeToggle" class="filter-dropdown-toggle select-wrapper">
                                <span id="dateRangeDisplay">Date Range</span>
                                <!-- <span class="arrow-icon"> &#x2304</span> -->
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
                                    <th>Agency</th>
                                    <th>Type</th>
                                    <th>Contact Name</th>
                                    <th>Email</th>
                                    <th>Date Submitted</th>
                                    <th>Status</th>
                                    <th>Date Trigger</th>
                                </tr>
                            </thead>
                            <?php  
                            
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
                                $category = get_the_category()[0]->name;
                                $date = get_the_date('d M, Y');
                                
                            ?>

                            <tbody id="tableBody"> 
                                <tr data-type="CCSS">
                                    <td><a href="pages/application.html"><?php echo $title; ?></a></td>
                                    <td><?php echo $category; ?></td>
                                    <td><?php echo $contact_name; ?></td>
                                    <td><?php echo $email; ?></td>
                                    <td><?php echo $date; ?></td>
                                    <td><span class="badge success"><?php echo $status; ?></span></td>
                                    <td><?php echo $expiry_date; ?></td>
                                </tr>
                                <?php endwhile; 
                                wp_reset_postdata();
                                endif;
                                ?>
                            </tbody>
                        </table>
                    </div>

                    <nav class="pagination-container" aria-label="Page navigation">
                        <ul class="pagination" id="pagination-links">
                            <li class="page-item "><a href="#">&laquo;</a></li>
                            <li class="page-item active"><a href="#">1</a></li>
                            <li class="page-item"><a href="#">2</a></li>
                            <li class="page-item"><a href="#">3</a></li>
                            <li class="page-item"><a href="#">4</a></li>
                            <li class="page-item"><a href="#">5</a></li>
                            <li class="page-item"><a href="#">&raquo;</a></li>
                        </ul>
                    </nav>
                    
                </div>
                
            </main>
        </div>
    </div>
    <?php wp_footer(); ?>
</body>
</html>