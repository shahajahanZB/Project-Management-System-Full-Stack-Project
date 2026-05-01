package com.example.proman.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Value("${app.document-processor.executor.core-pool-size:12}")
    private int corePoolSize;

    @Value("${app.document-processor.executor.max-pool-size:24}")
    private int maxPoolSize;

    @Value("${app.document-processor.executor.queue-capacity:1000}")
    private int queueCapacity;

    @Value("${app.document-processor.executor.await-termination-seconds:30}")
    private int awaitTerminationSeconds;

    @Bean(name = "documentExecutor")
    public Executor documentExecutor() {

        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("Doc-AI-");

        executor.setRejectedExecutionHandler(
                new ThreadPoolExecutor.CallerRunsPolicy());

        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(awaitTerminationSeconds);

        executor.initialize();

        return executor;
    }
    @Override
    public Executor getAsyncExecutor() {
        return documentExecutor();
    }
}
